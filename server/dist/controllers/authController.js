"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const commonResponse_1 = require("../utils/commonResponse");
const authService_1 = require("../services/authService");
class AuthController {
    constructor() {
        this.authService = new authService_1.AuthService();
    }
    loginController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const loginResult = yield this.authService.loginService(req);
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
                return res.status(200).json((0, commonResponse_1.commonResponse)(true, loginResult, 'Login successful'));
            }
            catch (error) {
                return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, error instanceof Error ? error.message : 'Authentication failed'));
            }
        });
    }
    registerController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const registerResult = yield this.authService.registerService(req);
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
                return res.status(200).json((0, commonResponse_1.commonResponse)(true, registerResult, 'Registration successful'));
            }
            catch (error) {
                return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, error instanceof Error ? error.message : 'Registration failed'));
            }
        });
    }
    googleLoginController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const loginResult = yield this.authService.googleLoginService(req);
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
                return res.status(200).json((0, commonResponse_1.commonResponse)(true, loginResult, 'Google login successful'));
            }
            catch (error) {
                return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, error instanceof Error ? error.message : 'Google authentication failed'));
            }
        });
    }
    refreshTokenController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Try to get refresh token from body or cookie
                const refreshToken = req.body.refreshToken || ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken);
                if (!refreshToken) {
                    return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, 'Refresh token is required'));
                }
                req.body.refreshToken = refreshToken;
                const result = yield this.authService.refreshTokenService(req);
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
                return res.status(200).json((0, commonResponse_1.commonResponse)(true, result, 'Token refreshed successfully'));
            }
            catch (error) {
                return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, error instanceof Error ? error.message : 'Token refresh failed'));
            }
        });
    }
    logoutController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const refreshToken = req.body.refreshToken || ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken);
                if (refreshToken) {
                    req.body.refreshToken = refreshToken;
                    yield this.authService.logoutService(req);
                }
                // Clear cookies
                res.clearCookie('accessToken');
                res.clearCookie('refreshToken');
                return res.status(200).json((0, commonResponse_1.commonResponse)(true, null, 'Logged out successfully'));
            }
            catch (error) {
                return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, error instanceof Error ? error.message : 'Logout failed'));
            }
        });
    }
    changePasswordController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.authService.changePassword(req);
                return res.status(200).json((0, commonResponse_1.commonResponse)(true, result, 'Password updated successfully'));
            }
            catch (error) {
                return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, error instanceof Error ? error.message : 'An unknown error occurred'));
            }
        });
    }
}
exports.AuthController = AuthController;
