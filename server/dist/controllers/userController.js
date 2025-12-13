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
exports.UserController = void 0;
const userService_1 = require("../services/userService");
const commonResponse_1 = require("../utils/commonResponse");
class UserController {
    constructor() {
        this.userService = new userService_1.UserService();
    }
    saveUpdateUserController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.userService.saveOrUpdateUser(req);
                if (!result.success) {
                    return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, result.message));
                }
                return res.status(200).json((0, commonResponse_1.commonResponse)(true, result.user, result.message));
            }
            catch (error) {
                return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, error instanceof Error ? error.message : 'An unknown error occurred'));
            }
        });
    }
    ;
    getUserTypesController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userTypes = yield this.userService.getUserTypes();
                return res.status(200).json((0, commonResponse_1.commonResponse)(true, userTypes, "User types fetched successfully."));
            }
            catch (error) {
                return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, "Internal server error."));
            }
        });
    }
    ;
    getModules(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const modules = yield this.userService.getAllModules();
                return res.status(200).json((0, commonResponse_1.commonResponse)(true, modules, 'Modules fetched successfully.'));
            }
            catch (error) {
                console.error('Error fetching modules:', error);
                return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, 'Internal server error.'));
            }
        });
    }
    ;
    updateUserTypesController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { oldName, newName } = req.body;
                // Validate request data
                if (!oldName || !newName) {
                    return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, "Both oldName and newName are required."));
                }
                const result = yield this.userService.updateUserTypeName(req);
                if (result.modifiedCount === 0) {
                    return res.status(404).json((0, commonResponse_1.commonResponse)(false, null, "User type not found or already updated."));
                }
                return res.status(200).json((0, commonResponse_1.commonResponse)(true, result, "User type updated successfully."));
            }
            catch (error) {
                console.error("Error updating user type:", error);
                return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, "Internal server error."));
            }
        });
    }
    ;
    addUserTypeController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name } = req.body;
                // Validate input
                if (!name) {
                    return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, "User type name is required."));
                }
                const { newUserType, message } = yield this.userService.addUserType(req);
                return res.status(200).json((0, commonResponse_1.commonResponse)(true, newUserType, message));
            }
            catch (error) {
                console.error("Error updating user type:", error);
                return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, "Internal server error."));
            }
        });
    }
    ;
    getAllUserList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { vendorId } = req.params;
                if (!vendorId) {
                    return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, "vendorId is required."));
                }
                const { userList, message } = yield this.userService.getAllUserList(vendorId);
                return res.status(200).json((0, commonResponse_1.commonResponse)(true, userList, message));
            }
            catch (error) {
                console.error("Error updating user type:", error);
                return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, "Internal server error."));
            }
        });
    }
    ;
    GetVendorUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userDetails, message } = yield this.userService.GetVendorUserById(req);
                return res.status(200).json((0, commonResponse_1.commonResponse)(true, userDetails, message));
            }
            catch (error) {
                return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, "Internal server error."));
            }
        });
    }
    ;
    DeleteVendorUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id)
                    return res.status(200).json({ success: false, message: 'User ID is required' });
                const message = yield this.userService.DeleteVendorUserById(req);
                return message
                    ? res.status(200).json({ success: true, message })
                    : res.status(200).json({ success: false, message: 'User not found' });
            }
            catch (error) {
                return res.status(200).json({ success: false, message: error.message });
            }
        });
    }
    ;
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { success, message } = yield this.userService.resetPassword(req);
                return res.status(200).json((0, commonResponse_1.commonResponse)(success, null, message));
            }
            catch (error) {
                return res.status(200).json({ success: false, message: error.message });
            }
        });
    }
    ;
}
exports.UserController = UserController;
