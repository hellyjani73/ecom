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
exports.ProductController = void 0;
const productService_1 = require("../services/productService");
const productService = new productService_1.ProductService();
class ProductController {
    createProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield productService.createProduct(req);
                res.status(201).json({
                    success: true,
                    message: result.message,
                    data: result.product,
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to create product',
                });
            }
        });
    }
    getAllProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield productService.getAllProducts(req);
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: {
                        products: result.products,
                        total: result.total,
                        page: result.page,
                        limit: result.limit,
                        totalPages: result.totalPages,
                    },
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to fetch products',
                });
            }
        });
    }
    getProductById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield productService.getProductById(req);
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.product,
                });
            }
            catch (error) {
                res.status(404).json({
                    success: false,
                    message: error.message || 'Product not found',
                });
            }
        });
    }
    updateProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield productService.updateProduct(req);
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.product,
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to update product',
                });
            }
        });
    }
    deleteProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield productService.deleteProduct(req);
                res.status(200).json({
                    success: true,
                    message: result.message,
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to delete product',
                });
            }
        });
    }
    bulkAction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield productService.bulkAction(req);
                res.status(200).json({
                    success: true,
                    message: result.message,
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to perform bulk action',
                });
            }
        });
    }
    uploadImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield productService.uploadImage(req);
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: {
                        url: result.url,
                    },
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to upload image',
                });
            }
        });
    }
}
exports.ProductController = ProductController;
