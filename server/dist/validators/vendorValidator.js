"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchemaValidator = exports.refreshTokenValidator = exports.googleLoginValidator = exports.registerValidator = exports.loginValidator = void 0;
const joi_1 = __importDefault(require("joi"));
exports.loginValidator = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email address',
    }),
    password: joi_1.default.string().required().messages({
        'string.empty': 'Password is required',
    }),
});
exports.registerValidator = joi_1.default.object({
    name: joi_1.default.string().required().min(2).max(100).messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name must not exceed 100 characters',
    }),
    email: joi_1.default.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email address',
    }),
    password: joi_1.default.string()
        .min(6)
        .max(128)
        .required()
        .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters',
        'string.max': 'Password must not exceed 128 characters',
    }),
    role: joi_1.default.string().valid('admin', 'customer').optional().messages({
        'any.only': 'Role must be one of: admin, customer',
    }),
});
exports.googleLoginValidator = joi_1.default.object({
    accessToken: joi_1.default.string().required().messages({
        'string.empty': 'Google access token is required',
    }),
});
exports.refreshTokenValidator = joi_1.default.object({
    refreshToken: joi_1.default.string().optional().messages({
        'string.base': 'Refresh token must be a string',
    }),
});
exports.changePasswordSchemaValidator = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Email must be a valid email address',
    }),
    oldPassword: joi_1.default.string().required().messages({
        'string.empty': 'Old Password is required',
    }),
    newPassword: joi_1.default.string()
        .min(6)
        .max(128)
        .required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/) // Password should contain at least one lowercase, one uppercase, and one special character
        .messages({
        'string.base': 'New Password should be a type of string',
        'string.empty': 'New Password cannot be empty',
        'string.min': 'New Password should have a minimum length of 6 characters',
        'string.max': 'New Password should have a maximum length of 128 characters',
        'string.pattern.base': 'New Password should contain at least one uppercase letter, one lowercase letter, and one special character',
    }),
});
