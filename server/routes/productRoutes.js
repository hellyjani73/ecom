const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const sessionGuard = require('../middlewares/sessionGuard');
const adminGuard = require('../middlewares/adminGuard');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/slug/:slug', productController.getProductBySlug);

// Protected routes - Admin only (Use sessionGuard then adminGuard)
router.post('/', sessionGuard, adminGuard, productController.createProduct);
router.put('/:id', sessionGuard, adminGuard, productController.updateProduct);
router.delete('/:id', sessionGuard, adminGuard, productController.deleteProduct);
router.put('/:id/stock', sessionGuard, adminGuard, productController.updateStock);

module.exports = router;

