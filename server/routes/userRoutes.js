const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const sessionGuard = require('../middlewares/sessionGuard');
const adminGuard = require('../middlewares/adminGuard');

// Public routes
// None for users

// Protected routes - User can access their own profile
router.get('/profile', sessionGuard, userController.getProfile);
router.put('/profile', sessionGuard, userController.updateProfile);
router.put('/profile/password', sessionGuard, userController.updatePassword);

// Admin routes - Use sessionGuard then adminGuard
router.get('/', sessionGuard, adminGuard, userController.getAllUsers);
router.get('/:id', sessionGuard, adminGuard, userController.getUserById);
router.post('/', sessionGuard, adminGuard, userController.createUser);
router.put('/:id', sessionGuard, adminGuard, userController.updateUser);
router.delete('/:id', sessionGuard, adminGuard, userController.deleteUser);
router.put('/:id/password', sessionGuard, adminGuard, userController.updatePassword);

module.exports = router;

