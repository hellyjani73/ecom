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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticateUser = exports.requireAuth = exports.UserRole = void 0;
const commonResponse_1 = require("../utils/commonResponse");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const userModel_1 = require("../models/userModel");
const userModel_2 = __importDefault(require("../models/userModel"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (JWT_SECRET + '_refresh');
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["CUSTOMER"] = "customer";
})(UserRole || (exports.UserRole = UserRole = {}));
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map((err) => err.message);
            res.status(200).json((0, commonResponse_1.commonResponse)(false, null, `${errorMessages.join(', ')}`));
            return;
        }
        next();
    };
};
// Helper function to extract token from header or cookie
const extractToken = (req) => {
    var _a, _b;
    // Try header first (for backward compatibility)
    const headerToken = req.header('auth-token') || ((_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', ''));
    if (headerToken)
        return headerToken;
    // Try cookie
    const cookieToken = (_b = req.cookies) === null || _b === void 0 ? void 0 : _b.accessToken;
    if (cookieToken)
        return cookieToken;
    return null;
};
// Main authentication middleware - requireAuth
const requireAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = extractToken(req);
        if (!token) {
            res.status(401).json((0, commonResponse_1.commonResponse)(false, null, 'Access Denied. No token provided.'));
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Verify user still exists and is active
        const user = yield userModel_2.default.findById(decoded.userId).select('status role');
        if (!user) {
            res.status(401).json((0, commonResponse_1.commonResponse)(false, null, 'User not found.'));
            return;
        }
        if (user.status === userModel_1.UserStatus.SUSPENDED) {
            res.status(403).json((0, commonResponse_1.commonResponse)(false, null, 'Account is suspended.'));
            return;
        }
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role || user.role,
            userType: decoded.userType,
        };
        return next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json((0, commonResponse_1.commonResponse)(false, null, 'Token expired.'));
        }
        else {
            res.status(401).json((0, commonResponse_1.commonResponse)(false, null, 'Invalid Token'));
        }
        return;
    }
});
exports.requireAuth = requireAuth;
// Backward compatibility alias
exports.authenticateUser = exports.requireAuth;
// Require Admin role
const requireAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // First authenticate
    let authCompleted = false;
    yield (0, exports.requireAuth)(req, res, () => {
        authCompleted = true;
    });
    if (!authCompleted) {
        return; // requireAuth already sent response
    }
    // Then check role
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== userModel_1.UserRole.ADMIN) {
        res.status(403).json((0, commonResponse_1.commonResponse)(false, null, 'Access Denied. Admin role required.'));
        return;
    }
    return next();
});
exports.requireAdmin = requireAdmin;
exports.default = validateRequest;
