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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const middleware_1 = __importStar(require("../middleware/middleware"));
const vendorValidator_1 = require("../validators/vendorValidator");
const commonResponse_1 = require("../utils/commonResponse");
const router = (0, express_1.Router)();
const authController = new authController_1.AuthController();
// Public routes
router.post('/login', (0, middleware_1.default)(vendorValidator_1.loginValidator), (0, commonResponse_1.asyncHandler)(authController.loginController.bind(authController)));
router.post('/register', (0, middleware_1.default)(vendorValidator_1.registerValidator), (0, commonResponse_1.asyncHandler)(authController.registerController.bind(authController)));
router.post('/google', (0, middleware_1.default)(vendorValidator_1.googleLoginValidator), (0, commonResponse_1.asyncHandler)(authController.googleLoginController.bind(authController)));
router.post('/refresh', (0, middleware_1.default)(vendorValidator_1.refreshTokenValidator), (0, commonResponse_1.asyncHandler)(authController.refreshTokenController.bind(authController)));
router.post('/logout', (0, commonResponse_1.asyncHandler)(authController.logoutController.bind(authController)));
// Protected routes
router.post('/changePassword', middleware_1.requireAuth, (0, middleware_1.default)(vendorValidator_1.changePasswordSchemaValidator), (0, commonResponse_1.asyncHandler)(authController.changePasswordController.bind(authController)));
router.get('/health', (req, res) => {
    res.status(200).json({ message: 'API is running successfully!' });
});
exports.default = router;
