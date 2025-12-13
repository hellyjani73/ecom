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
exports.UserTypeController = void 0;
const UserTypeService_1 = require("../services/UserTypeService");
const commonResponse_1 = require("../utils/commonResponse");
class UserTypeController {
    constructor() {
        this.userTypeService = new UserTypeService_1.UserTypeService();
    }
    GetAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userTypes = yield this.userTypeService.GetAll();
                return res.status(200).json((0, commonResponse_1.commonResponse)(true, userTypes, 'User type retrieved successfully'));
            }
            catch (error) {
                return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, error instanceof Error ? error.message : 'An unknown error occurred'));
            }
        });
    }
    ;
}
exports.UserTypeController = UserTypeController;
