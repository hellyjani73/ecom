"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const userModel_1 = __importStar(require("../models/userModel"));
const refreshTokenModel_1 = __importDefault(require("../models/refreshTokenModel"));
const loginAttemptModel_1 = __importDefault(require("../models/loginAttemptModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const baseService_1 = require("./baseService");
const google_auth_library_1 = require("google-auth-library");
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (JWT_SECRET + '_refresh');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes
class AuthService extends baseService_1.BaseService {
    constructor() {
        super();
        this.googleClient = null;
        if (GOOGLE_CLIENT_ID) {
            this.googleClient = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID);
        }
    }
    // Generate JWT tokens
    generateTokens(user) {
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, {
            expiresIn: JWT_REFRESH_EXPIRES_IN,
        });
        return { accessToken, refreshToken };
    }
    // Save refresh token to database
    saveRefreshToken(userId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
            yield refreshTokenModel_1.default.findOneAndUpdate({ userId }, {
                userId,
                token,
                expiresAt,
            }, { upsert: true, new: true });
        });
    }
    // Check and handle brute force protection
    checkLoginAttempts(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const attempt = yield loginAttemptModel_1.default.findOne({ email });
            if (attempt && attempt.lockedUntil && attempt.lockedUntil > new Date()) {
                const remainingTime = Math.ceil((attempt.lockedUntil.getTime() - Date.now()) / 60000);
                throw new Error(`Account locked due to too many failed attempts. Try again in ${remainingTime} minutes.`);
            }
            if (attempt && attempt.attempts >= MAX_LOGIN_ATTEMPTS) {
                // Lock the account
                attempt.lockedUntil = new Date(Date.now() + LOCK_TIME);
                attempt.attempts = 0;
                yield attempt.save();
                throw new Error(`Account locked due to too many failed attempts. Try again in ${Math.ceil(LOCK_TIME / 60000)} minutes.`);
            }
        });
    }
    // Record failed login attempt
    recordFailedAttempt(email) {
        return __awaiter(this, void 0, void 0, function* () {
            yield loginAttemptModel_1.default.findOneAndUpdate({ email }, {
                $inc: { attempts: 1 },
                lastAttempt: new Date(),
            }, { upsert: true, new: true });
        });
    }
    // Reset login attempts on successful login
    resetLoginAttempts(email) {
        return __awaiter(this, void 0, void 0, function* () {
            yield loginAttemptModel_1.default.findOneAndUpdate({ email }, { attempts: 0, lockedUntil: null }, { upsert: true });
        });
    }
    // Email/Password Login
    loginService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                // Check brute force protection
                yield this.checkLoginAttempts(email.toLowerCase());
                // Find user
                const user = yield userModel_1.default.findOne({
                    email: { $regex: new RegExp(`^${email}$`, 'i') },
                });
                if (!user) {
                    yield this.recordFailedAttempt(email.toLowerCase());
                    throw new Error('Invalid email or password');
                }
                // Check if user is suspended
                if (user.status === userModel_1.UserStatus.SUSPENDED) {
                    throw new Error('Your account has been suspended. Please contact administrator.');
                }
                // Check if user is inactive
                if (user.status === userModel_1.UserStatus.INACTIVE) {
                    throw new Error('Your account is not active. Please contact administrator.');
                }
                // Verify password for local provider
                if (user.provider === userModel_1.AuthProvider.LOCAL) {
                    if (!user.passwordHash) {
                        yield this.recordFailedAttempt(email.toLowerCase());
                        throw new Error('Invalid email or password');
                    }
                    const isPasswordValid = yield bcryptjs_1.default.compare(password, user.passwordHash);
                    if (!isPasswordValid) {
                        yield this.recordFailedAttempt(email.toLowerCase());
                        throw new Error('Invalid email or password');
                    }
                }
                else {
                    yield this.recordFailedAttempt(email.toLowerCase());
                    throw new Error('Please use Google login for this account');
                }
                // Reset login attempts on success
                yield this.resetLoginAttempts(email.toLowerCase());
                // Generate tokens
                const { accessToken, refreshToken } = this.generateTokens(user);
                yield this.saveRefreshToken(user._id.toString(), refreshToken);
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
            }
            catch (error) {
                throw new Error((error === null || error === void 0 ? void 0 : error.message) || 'Login failed');
            }
        });
    }
    // Register new user
    registerService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, role } = req.body;
                // Check if user already exists
                const existingUser = yield userModel_1.default.findOne({
                    email: { $regex: new RegExp(`^${email}$`, 'i') },
                });
                if (existingUser) {
                    throw new Error('User with this email already exists');
                }
                // Hash password
                const salt = yield bcryptjs_1.default.genSalt(10);
                const passwordHash = yield bcryptjs_1.default.hash(password, salt);
                // Create user
                const user = new userModel_1.default({
                    name,
                    email: email.toLowerCase(),
                    passwordHash,
                    provider: userModel_1.AuthProvider.LOCAL,
                    role: role || userModel_1.UserRole.CUSTOMER,
                    status: userModel_1.UserStatus.ACTIVE,
                });
                yield user.save();
                // Generate tokens
                const { accessToken, refreshToken } = this.generateTokens(user);
                yield this.saveRefreshToken(user._id.toString(), refreshToken);
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
            }
            catch (error) {
                throw new Error((error === null || error === void 0 ? void 0 : error.message) || 'Registration failed');
            }
        });
    }
    // Google OAuth Login
    googleLoginService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { accessToken: googleAccessToken } = req.body;
                if (!this.googleClient) {
                    throw new Error('Google OAuth is not configured');
                }
                if (!googleAccessToken) {
                    throw new Error('Google access token is required');
                }
                // Verify Google token
                const ticket = yield this.googleClient.verifyIdToken({
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
                let user = yield userModel_1.default.findOne({
                    email: email.toLowerCase(),
                });
                if (user) {
                    // Update user if needed
                    if (!user.avatar && picture) {
                        user.avatar = picture;
                        yield user.save();
                    }
                    // Check if user is suspended
                    if (user.status === userModel_1.UserStatus.SUSPENDED) {
                        throw new Error('Your account has been suspended. Please contact administrator.');
                    }
                }
                else {
                    // Create new user with Google provider
                    user = new userModel_1.default({
                        name: name || email.split('@')[0],
                        email: email.toLowerCase(),
                        avatar: picture || null,
                        provider: userModel_1.AuthProvider.GOOGLE,
                        role: userModel_1.UserRole.CUSTOMER,
                        status: userModel_1.UserStatus.ACTIVE,
                    });
                    yield user.save();
                }
                // Generate tokens
                const { accessToken, refreshToken } = this.generateTokens(user);
                yield this.saveRefreshToken(user._id.toString(), refreshToken);
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
            }
            catch (error) {
                throw new Error((error === null || error === void 0 ? void 0 : error.message) || 'Google login failed');
            }
        });
    }
    // Refresh token
    refreshTokenService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken: token } = req.body;
                if (!token) {
                    throw new Error('Refresh token is required');
                }
                // Verify refresh token
                const decoded = jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
                // Check if token exists in database
                const storedToken = yield refreshTokenModel_1.default.findOne({
                    userId: decoded.userId,
                    token,
                });
                if (!storedToken || storedToken.expiresAt < new Date()) {
                    throw new Error('Invalid or expired refresh token');
                }
                // Get user
                const user = yield userModel_1.default.findById(decoded.userId);
                if (!user) {
                    throw new Error('User not found');
                }
                // Check if user is suspended
                if (user.status === userModel_1.UserStatus.SUSPENDED) {
                    throw new Error('Your account has been suspended. Please contact administrator.');
                }
                // Generate new tokens
                const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user);
                yield this.saveRefreshToken(user._id.toString(), newRefreshToken);
                // Delete old refresh token
                yield refreshTokenModel_1.default.deleteOne({ token });
                return {
                    accessToken,
                    refreshToken: newRefreshToken,
                };
            }
            catch (error) {
                throw new Error((error === null || error === void 0 ? void 0 : error.message) || 'Token refresh failed');
            }
        });
    }
    // Logout - invalidate refresh token
    logoutService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken: token } = req.body;
                if (token) {
                    yield refreshTokenModel_1.default.deleteOne({ token });
                }
                return { message: 'Logged out successfully' };
            }
            catch (error) {
                throw new Error((error === null || error === void 0 ? void 0 : error.message) || 'Logout failed');
            }
        });
    }
    // Change password (legacy support)
    changePassword(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = this.getUserId(req);
                if (!userId) {
                    throw new Error('User not authenticated');
                }
                const { oldPassword, newPassword } = req.body;
                const user = yield userModel_1.default.findById(userId);
                if (!user || !user.passwordHash) {
                    throw new Error('User not found or password not set');
                }
                const isPasswordValid = yield bcryptjs_1.default.compare(oldPassword, user.passwordHash);
                if (!isPasswordValid) {
                    throw new Error('Old password is incorrect');
                }
                const salt = yield bcryptjs_1.default.genSalt(10);
                user.passwordHash = yield bcryptjs_1.default.hash(newPassword, salt);
                yield user.save();
                return { message: 'Password updated successfully' };
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
}
exports.AuthService = AuthService;
