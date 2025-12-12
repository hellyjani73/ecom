import User, { IUser, UserRole, UserStatus, AuthProvider } from '../models/userModel';
import RefreshToken from '../models/refreshTokenModel';
import LoginAttempt from '../models/loginAttemptModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { BaseService } from './baseService';
import { AuthenticatedRequest } from '../middleware/middleware';
import { OAuth2Client } from 'google-auth-library';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (JWT_SECRET + '_refresh');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes

export class AuthService extends BaseService {
    private googleClient: OAuth2Client | null = null;

    constructor() {
        super();
        if (GOOGLE_CLIENT_ID) {
            this.googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
        }
    }

    // Generate JWT tokens
    private generateTokens(user: IUser) {
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };

        const accessToken = jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
            expiresIn: JWT_REFRESH_EXPIRES_IN,
        });

        return { accessToken, refreshToken };
    }

    // Save refresh token to database
    private async saveRefreshToken(userId: string, token: string) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await RefreshToken.findOneAndUpdate(
            { userId },
            {
                userId,
                token,
                expiresAt,
            },
            { upsert: true, new: true }
        );
    }

    // Check and handle brute force protection
    private async checkLoginAttempts(email: string): Promise<void> {
        const attempt = await LoginAttempt.findOne({ email });

        if (attempt && attempt.lockedUntil && attempt.lockedUntil > new Date()) {
            const remainingTime = Math.ceil((attempt.lockedUntil.getTime() - Date.now()) / 60000);
            throw new Error(`Account locked due to too many failed attempts. Try again in ${remainingTime} minutes.`);
        }

        if (attempt && attempt.attempts >= MAX_LOGIN_ATTEMPTS) {
            // Lock the account
            attempt.lockedUntil = new Date(Date.now() + LOCK_TIME);
            attempt.attempts = 0;
            await attempt.save();
            throw new Error(`Account locked due to too many failed attempts. Try again in ${Math.ceil(LOCK_TIME / 60000)} minutes.`);
        }
    }

    // Record failed login attempt
    private async recordFailedAttempt(email: string) {
        await LoginAttempt.findOneAndUpdate(
            { email },
            {
                $inc: { attempts: 1 },
                lastAttempt: new Date(),
            },
            { upsert: true, new: true }
        );
    }

    // Reset login attempts on successful login
    private async resetLoginAttempts(email: string) {
        await LoginAttempt.findOneAndUpdate(
            { email },
            { attempts: 0, lockedUntil: null },
            { upsert: true }
        );
    }

    // Email/Password Login
    public async loginService(req: AuthenticatedRequest) {
        try {
            const { email, password } = req.body;

            // Check brute force protection
            await this.checkLoginAttempts(email.toLowerCase());

            // Find user
            const user = await User.findOne({
                email: { $regex: new RegExp(`^${email}$`, 'i') },
            });

            if (!user) {
                await this.recordFailedAttempt(email.toLowerCase());
                throw new Error('Invalid email or password');
            }

            // Check if user is suspended
            if (user.status === UserStatus.SUSPENDED) {
                throw new Error('Your account has been suspended. Please contact administrator.');
            }

            // Check if user is inactive
            if (user.status === UserStatus.INACTIVE) {
                throw new Error('Your account is not active. Please contact administrator.');
            }

            // Verify password for local provider
            if (user.provider === AuthProvider.LOCAL) {
                if (!user.passwordHash) {
                    await this.recordFailedAttempt(email.toLowerCase());
                    throw new Error('Invalid email or password');
                }

                const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
                if (!isPasswordValid) {
                    await this.recordFailedAttempt(email.toLowerCase());
                    throw new Error('Invalid email or password');
                }
            } else {
                await this.recordFailedAttempt(email.toLowerCase());
                throw new Error('Please use Google login for this account');
            }

            // Reset login attempts on success
            await this.resetLoginAttempts(email.toLowerCase());

            // Generate tokens
            const { accessToken, refreshToken } = this.generateTokens(user);
            await this.saveRefreshToken(user._id.toString(), refreshToken);

            const userDetails = {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                provider: user.provider,
            };

            return {
                accessToken,
                refreshToken,
                userDetails,
            };
        } catch (error: any) {
            throw new Error(error?.message || 'Login failed');
        }
    }

    // Register new user
    public async registerService(req: AuthenticatedRequest) {
        try {
            const { name, email, password, role } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({
                email: { $regex: new RegExp(`^${email}$`, 'i') },
            });

            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // Create user
            const user = new User({
                name,
                email: email.toLowerCase(),
                passwordHash,
                provider: AuthProvider.LOCAL,
                role: role || UserRole.CUSTOMER,
                status: UserStatus.ACTIVE,
            });

            await user.save();

            // Generate tokens
            const { accessToken, refreshToken } = this.generateTokens(user);
            await this.saveRefreshToken(user._id.toString(), refreshToken);

            const userDetails = {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                provider: user.provider,
            };

            return {
                accessToken,
                refreshToken,
                userDetails,
            };
        } catch (error: any) {
            throw new Error(error?.message || 'Registration failed');
        }
    }

    // Google OAuth Login
    public async googleLoginService(req: AuthenticatedRequest) {
        try {
            const { accessToken: googleAccessToken } = req.body;

            if (!this.googleClient) {
                throw new Error('Google OAuth is not configured');
            }

            if (!googleAccessToken) {
                throw new Error('Google access token is required');
            }

            // Verify Google token
            const ticket = await this.googleClient.verifyIdToken({
                idToken: googleAccessToken,
                audience: GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            if (!payload) {
                throw new Error('Invalid Google token');
            }

            const { email, name, picture } = payload;

            if (!email) {
                throw new Error('Email not provided by Google');
            }

            // Find or create user
            let user = await User.findOne({
                email: email.toLowerCase(),
            });

            if (user) {
                // Update user if needed
                if (!user.avatar && picture) {
                    user.avatar = picture;
                    await user.save();
                }

                // Check if user is suspended
                if (user.status === UserStatus.SUSPENDED) {
                    throw new Error('Your account has been suspended. Please contact administrator.');
                }
            } else {
                // Create new user with Google provider
                user = new User({
                    name: name || email.split('@')[0],
                    email: email.toLowerCase(),
                    avatar: picture || null,
                    provider: AuthProvider.GOOGLE,
                    role: UserRole.CUSTOMER,
                    status: UserStatus.ACTIVE,
                });

                await user.save();
            }

            // Generate tokens
            const { accessToken, refreshToken } = this.generateTokens(user);
            await this.saveRefreshToken(user._id.toString(), refreshToken);

            const userDetails = {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                provider: user.provider,
            };

            return {
                accessToken,
                refreshToken,
                userDetails,
            };
        } catch (error: any) {
            throw new Error(error?.message || 'Google login failed');
        }
    }

    // Refresh token
    public async refreshTokenService(req: AuthenticatedRequest) {
        try {
            const { refreshToken: token } = req.body;

            if (!token) {
                throw new Error('Refresh token is required');
            }

            // Verify refresh token
            const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;

            // Check if token exists in database
            const storedToken = await RefreshToken.findOne({
                userId: decoded.userId,
                token,
            });

            if (!storedToken || storedToken.expiresAt < new Date()) {
                throw new Error('Invalid or expired refresh token');
            }

            // Get user
            const user = await User.findById(decoded.userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Check if user is suspended
            if (user.status === UserStatus.SUSPENDED) {
                throw new Error('Your account has been suspended. Please contact administrator.');
            }

            // Generate new tokens
            const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user);
            await this.saveRefreshToken(user._id.toString(), newRefreshToken);

            // Delete old refresh token
            await RefreshToken.deleteOne({ token });

            return {
                accessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error: any) {
            throw new Error(error?.message || 'Token refresh failed');
        }
    }

    // Logout - invalidate refresh token
    public async logoutService(req: AuthenticatedRequest) {
        try {
            const { refreshToken: token } = req.body;

            if (token) {
                await RefreshToken.deleteOne({ token });
            }

            return { message: 'Logged out successfully' };
        } catch (error: any) {
            throw new Error(error?.message || 'Logout failed');
        }
    }

    // Change password (legacy support)
    public async changePassword(req: AuthenticatedRequest) {
        try {
            const userId = this.getUserId(req);
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const { oldPassword, newPassword } = req.body;
            const user = await User.findById(userId);

            if (!user || !user.passwordHash) {
                throw new Error('User not found or password not set');
            }

            const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
            if (!isPasswordValid) {
                throw new Error('Old password is incorrect');
            }

            const salt = await bcrypt.genSalt(10);
            user.passwordHash = await bcrypt.hash(newPassword, salt);
            await user.save();

            return { message: 'Password updated successfully' };
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}
