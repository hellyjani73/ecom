"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.commonResponse = void 0;
const commonResponse = (success, data, message) => {
    return {
        success,
        data: data !== undefined && data !== null ? data : null, // Ensures null is returned, not {}
        message: typeof message === 'string' ? message : '',
    };
};
exports.commonResponse = commonResponse;
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.asyncHandler = asyncHandler;
