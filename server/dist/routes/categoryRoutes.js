"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const middleware_1 = require("../middleware/middleware");
const commonResponse_1 = require("../utils/commonResponse");
const router = (0, express_1.Router)();
const categoryController = new categoryController_1.CategoryController();
// Public route - Get all categories (anyone can view, no auth required)
// This allows the home page to display categories without authentication
router.get('/all', (0, commonResponse_1.asyncHandler)(categoryController.getAllCategoriesController.bind(categoryController)));
// All other category routes require authentication
router.use(middleware_1.requireAuth);
// Upload image route (requires admin)
router.post('/upload-image', middleware_1.requireAdmin, (0, commonResponse_1.asyncHandler)(categoryController.uploadImageController.bind(categoryController)));
// Create category (requires admin)
router.post('/create', middleware_1.requireAdmin, (0, commonResponse_1.asyncHandler)(categoryController.createCategoryController.bind(categoryController)));
// Get category by ID (authenticated users can view)
router.get('/:id', (0, commonResponse_1.asyncHandler)(categoryController.getCategoryByIdController.bind(categoryController)));
// Update category (requires admin)
router.put('/:id', middleware_1.requireAdmin, (0, commonResponse_1.asyncHandler)(categoryController.updateCategoryController.bind(categoryController)));
// Delete category (requires admin)
router.delete('/:id', middleware_1.requireAdmin, (0, commonResponse_1.asyncHandler)(categoryController.deleteCategoryController.bind(categoryController)));
exports.default = router;
