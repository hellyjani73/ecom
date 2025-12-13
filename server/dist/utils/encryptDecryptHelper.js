"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptPassword = encryptPassword;
exports.decryptPassword = decryptPassword;
const crypto_1 = __importDefault(require("crypto"));
const algorithm = 'aes-256-cbc';
const secretKey = '12345678901234567890123456789012';
const iv = '1234567890123456'; // 16 chars
function encryptPassword(password) {
    const cipher = crypto_1.default.createCipheriv(algorithm, Buffer.from(secretKey), Buffer.from(iv));
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}
function decryptPassword(encryptedPassword) {
    const decipher = crypto_1.default.createDecipheriv(algorithm, Buffer.from(secretKey), Buffer.from(iv));
    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
