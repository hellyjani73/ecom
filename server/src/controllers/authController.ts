import { Request, Response } from 'express';
import { commonResponse } from '../utils/commonResponse';
import { AuthService } from '../services/authService';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    public async loginController(req: Request, res: Response) {
        try {
            const loginResult = await this.authService.loginService(req);
            
            // Set HttpOnly cookies
            res.cookie('accessToken', loginResult.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000, // 15 minutes
            });

            res.cookie('refreshToken', loginResult.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            return res.status(200).json(commonResponse(true, loginResult, 'Login successful'));
        } catch (error: any) {
            return res.status(200).json(commonResponse(false, null, error instanceof Error ? error.message : 'Authentication failed'));
        }
    }

    public async registerController(req: Request, res: Response) {
        try {
            const registerResult = await this.authService.registerService(req);
            
            // Set HttpOnly cookies
            res.cookie('accessToken', registerResult.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000, // 15 minutes
            });

            res.cookie('refreshToken', registerResult.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            return res.status(200).json(commonResponse(true, registerResult, 'Registration successful'));
        } catch (error: any) {
            return res.status(200).json(commonResponse(false, null, error instanceof Error ? error.message : 'Registration failed'));
        }
    }

    public async googleLoginController(req: Request, res: Response) {
        try {
            const loginResult = await this.authService.googleLoginService(req);
            
            // Set HttpOnly cookies
            res.cookie('accessToken', loginResult.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000, // 15 minutes
            });

            res.cookie('refreshToken', loginResult.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            return res.status(200).json(commonResponse(true, loginResult, 'Google login successful'));
        } catch (error: any) {
            return res.status(200).json(commonResponse(false, null, error instanceof Error ? error.message : 'Google authentication failed'));
        }
    }

    public async refreshTokenController(req: Request, res: Response) {
        try {
            // Try to get refresh token from body or cookie
            const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
            
            if (!refreshToken) {
                return res.status(200).json(commonResponse(false, null, 'Refresh token is required'));
            }

            req.body.refreshToken = refreshToken;
            const result = await this.authService.refreshTokenService(req);
            
            // Set new HttpOnly cookies
            res.cookie('accessToken', result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000, // 15 minutes
            });

            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            return res.status(200).json(commonResponse(true, result, 'Token refreshed successfully'));
        } catch (error: any) {
            return res.status(200).json(commonResponse(false, null, error instanceof Error ? error.message : 'Token refresh failed'));
        }
    }

    public async logoutController(req: Request, res: Response) {
        try {
            const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
            if (refreshToken) {
                req.body.refreshToken = refreshToken;
                await this.authService.logoutService(req);
            }

            // Clear cookies
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');

            return res.status(200).json(commonResponse(true, null, 'Logged out successfully'));
        } catch (error: any) {
            return res.status(200).json(commonResponse(false, null, error instanceof Error ? error.message : 'Logout failed'));
        }
    }

    public async changePasswordController(req: Request, res: Response) {
        try {
            const result = await this.authService.changePassword(req);
            return res.status(200).json(commonResponse(true, result, 'Password updated successfully'));
        } catch (error: any) {
            return res.status(200).json(commonResponse(false, null, error instanceof Error ? error.message : 'An unknown error occurred'));
        }
    }
}