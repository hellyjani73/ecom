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
exports.CategoryController = void 0;
const commonResponse_1 = require("../utils/commonResponse");
const categoryService_1 = require("../services/categoryService");
class CategoryController {
    constructor() {
        this.categoryService = new categoryService_1.CategoryService();
    }
    createCategoryController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.categoryService.createCategory(req);
                return res.status(200).json((0, commonResponse_1.commonResponse)(true, result.category, result.message));
            }
            catch (error) {
                return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, error instanceof Error ? error.message : 'Failed to create category'));
            }
        });
    }
    getAllCategoriesController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.categoryService.getAllCategories(req);
                return res.status(200).json((0, commonResponse_1.commonResponse)(true, result.categories, result.message));
            }
            catch (error) {
                return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, error instanceof Error ? error.message : 'Failed to fetch categories'));
            }
        });
    }
    getCategoryByIdController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.categoryService.getCategoryById(req);
                return res.status(200).json((0, commonResponse_1.commonResponse)(true, result.category, result.message));
            }
            catch (error) {
                return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, error instanceof Error ? error.message : 'Failed to fetch category'));
            }
        });
    }
    updateCategoryController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.categoryService.updateCategory(req);
                return res.status(200).json((0, commonResponse_1.commonResponse)(true, result.category, result.message));
            }
            catch (error) {
                return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, error instanceof Error ? error.message : 'Failed to update category'));
            }
        });
    }
    deleteCategoryController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.categoryService.deleteCategory(req);
                return res.status(200).json((0, commonResponse_1.commonResponse)(true, null, result.message));
            }
            catch (error) {
                return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, error instanceof Error ? error.message : 'Failed to delete category'));
            }
        });
    }
    uploadImageController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.categoryService.uploadImage(req);
                return res.status(200).json((0, commonResponse_1.commonResponse)(true, { url: result.url }, result.message));
            }
            catch (error) {
                return res.status(200).json((0, commonResponse_1.commonResponse)(false, null, error instanceof Error ? error.message : 'Failed to upload image'));
            }
        });
    }
}
exports.CategoryController = CategoryController;
