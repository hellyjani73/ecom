const express = require('express');
const router = express.Router();
const adminCategoryController = require('../controllers/adminCategoryController');
const sessionGuard = require('../middlewares/sessionGuard');
const adminGuard = require('../middlewares/adminGuard');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Admin category routes
router.post('/', sessionGuard, adminGuard, upload.single('image'), adminCategoryController.createCategory);
router.get('/', sessionGuard, adminGuard, adminCategoryController.getAllCategories);
router.get('/:id', sessionGuard, adminGuard, adminCategoryController.getCategoryById);
router.post('/:id/update', sessionGuard, adminGuard, upload.single('image'), adminCategoryController.updateCategory);
router.delete('/:id', sessionGuard, adminGuard, adminCategoryController.deleteCategory);

module.exports = router;

