import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { requireAuth, requireAdmin } from '../middleware/middleware';
import { asyncHandler } from '../utils/commonResponse';

const router = Router();
const categoryController = new CategoryController();

// Public route - Get all categories (anyone can view, no auth required)
// This allows the home page to display categories without authentication
router.get(
    '/all',
    asyncHandler(categoryController.getAllCategoriesController.bind(categoryController))
);

// All other category routes require authentication
router.use(requireAuth);

// Upload image route (requires admin)
router.post(
    '/upload-image',
    requireAdmin,
    asyncHandler(categoryController.uploadImageController.bind(categoryController))
);

// Create category (requires admin)
router.post(
    '/create',
    requireAdmin,
    asyncHandler(categoryController.createCategoryController.bind(categoryController))
);

// Get category by ID (authenticated users can view)
router.get(
    '/:id',
    asyncHandler(categoryController.getCategoryByIdController.bind(categoryController))
);

// Update category (requires admin)
router.put(
    '/:id',
    requireAdmin,
    asyncHandler(categoryController.updateCategoryController.bind(categoryController))
);

// Delete category (requires admin)
router.delete(
    '/:id',
    requireAdmin,
    asyncHandler(categoryController.deleteCategoryController.bind(categoryController))
);

export default router;
