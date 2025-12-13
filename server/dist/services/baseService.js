"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
class BaseService {
    getUserId(req) {
        var _a;
        return ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || null;
    }
    getUserRole(req) {
        var _a;
        return ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || null;
    }
}
exports.BaseService = BaseService;
