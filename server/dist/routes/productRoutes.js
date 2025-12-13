"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const middleware_1 = require("../middleware/middleware");
const router = (0, express_1.Router)();
const productController = new productController_1.ProductController();
// All product routes require authentication and admin role
router.post('/', middleware_1.requireAuth, middleware_1.requireAdmin, productController.createProduct.bind(productController));
router.get('/', middleware_1.requireAuth, middleware_1.requireAdmin, productController.getAllProducts.bind(productController));
router.get('/:id', middleware_1.requireAuth, middleware_1.requireAdmin, productController.getProductById.bind(productController));
router.put('/:id', middleware_1.requireAuth, middleware_1.requireAdmin, productController.updateProduct.bind(productController));
router.delete('/:id', middleware_1.requireAuth, middleware_1.requireAdmin, productController.deleteProduct.bind(productController));
router.post('/bulk-action', middleware_1.requireAuth, middleware_1.requireAdmin, productController.bulkAction.bind(productController));
router.post('/upload-image', middleware_1.requireAuth, middleware_1.requireAdmin, productController.uploadImage.bind(productController));
exports.default = router;
