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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel_1 = __importStar(require("../models/userModel"));
// Load environment variables
dotenv_1.default.config();
const createAdminUser = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to MongoDB
        const DATABASE = process.env.DATABASE;
        if (!DATABASE) {
            throw new Error('DATABASE connection string is missing in environment variables');
        }
        console.log('Connecting to MongoDB...');
        yield mongoose_1.default.connect(DATABASE);
        console.log('✅ Connected to MongoDB');
        // Admin user details (you can modify these)
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const adminName = process.env.ADMIN_NAME || 'Admin User';
        // Check if admin user already exists
        const existingAdmin = yield userModel_1.default.findOne({
            email: adminEmail.toLowerCase(),
        });
        if (existingAdmin) {
            console.log(`⚠️  Admin user with email ${adminEmail} already exists.`);
            console.log('   Updating to admin role...');
            existingAdmin.role = userModel_1.UserRole.ADMIN;
            existingAdmin.status = userModel_1.UserStatus.ACTIVE;
            // Update password if provided
            if (adminPassword) {
                const salt = yield bcryptjs_1.default.genSalt(10);
                existingAdmin.passwordHash = yield bcryptjs_1.default.hash(adminPassword, salt);
            }
            yield existingAdmin.save();
            console.log('✅ Admin user updated successfully!');
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Role: ${existingAdmin.role}`);
        }
        else {
            // Hash password
            const salt = yield bcryptjs_1.default.genSalt(10);
            const passwordHash = yield bcryptjs_1.default.hash(adminPassword, salt);
            // Create admin user
            const adminUser = new userModel_1.default({
                name: adminName,
                email: adminEmail.toLowerCase(),
                passwordHash,
                provider: userModel_1.AuthProvider.LOCAL,
                role: userModel_1.UserRole.ADMIN,
                status: userModel_1.UserStatus.ACTIVE,
            });
            yield adminUser.save();
            console.log('✅ Admin user created successfully!');
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Password: ${adminPassword}`);
            console.log(`   Role: ${adminUser.role}`);
        }
        // Close connection
        yield mongoose_1.default.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        yield mongoose_1.default.connection.close();
        process.exit(1);
    }
});
// Run the script
createAdminUser();
