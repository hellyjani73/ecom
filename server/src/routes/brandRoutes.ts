import { Router } from 'express';
import { BrandController } from '../controllers/brandController';
import { requireAuth, requireAdmin } from '../middleware/middleware';
import { asyncHandler } from '../utils/commonResponse';

const router = Router();
const brandController = new BrandController();

// All brand routes require authentication
router.use(requireAuth);

// Get all brands (authenticated users can view)
router.get(
  '/',
  asyncHandler(brandController.getAllBrandsController.bind(brandController))
);

// Get brand by ID (authenticated users can view)
router.get(
  '/:id',
  asyncHandler(brandController.getBrandByIdController.bind(brandController))
);

// Create brand (requires admin)
router.post(
  '/create',
  requireAdmin,
  asyncHandler(brandController.createBrandController.bind(brandController))
);

// Update brand (requires admin)
router.put(
  '/:id',
  requireAdmin,
  asyncHandler(brandController.updateBrandController.bind(brandController))
);

// Delete brand (requires admin)
router.delete(
  '/:id',
  requireAdmin,
  asyncHandler(brandController.deleteBrandController.bind(brandController))
);

export default router;

