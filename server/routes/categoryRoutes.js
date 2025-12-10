const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const sessionGuard = require('../middlewares/sessionGuard');
const adminGuard = require('../middlewares/adminGuard');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/slug/:slug', categoryController.getCategoryBySlug);

// Protected routes - Admin only (Use sessionGuard then adminGuard)
router.post('/', sessionGuard, adminGuard, categoryController.createCategory);
router.put('/:id', sessionGuard, adminGuard, categoryController.updateCategory);
router.delete('/:id', sessionGuard, adminGuard, categoryController.deleteCategory);

module.exports = router;

