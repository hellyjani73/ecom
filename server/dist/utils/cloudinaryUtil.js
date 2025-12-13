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
exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: 'dn7y3tuxa',
    api_key: '343875886397291',
    api_secret: 'hZV8JSu1YXv4C-LQiPrAUz0B-MY',
});
// Upload image to Cloudinary
const uploadToCloudinary = (base64Image) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.v2.uploader.upload(base64Image);
        return result.secure_url;
    }
    catch (error) {
        console.error('Error uploading to Cloudinary:', error.message);
        throw new Error('Failed to upload image to Cloudinary');
    }
});
exports.uploadToCloudinary = uploadToCloudinary;
