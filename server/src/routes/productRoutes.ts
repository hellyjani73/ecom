import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { requireAuth, requireAdmin } from '../middleware/middleware';

const router = Router();
const productController = new ProductController();

// All product routes require authentication and admin role
router.post('/', requireAuth, requireAdmin, productController.createProduct.bind(productController));
router.get('/', requireAuth, requireAdmin, productController.getAllProducts.bind(productController));
router.get('/:id', requireAuth, requireAdmin, productController.getProductById.bind(productController));
router.put('/:id', requireAuth, requireAdmin, productController.updateProduct.bind(productController));
router.delete('/:id', requireAuth, requireAdmin, productController.deleteProduct.bind(productController));
router.post('/bulk-action', requireAuth, requireAdmin, productController.bulkAction.bind(productController));
router.post('/upload-image', requireAuth, requireAdmin, productController.uploadImage.bind(productController));

export default router;

