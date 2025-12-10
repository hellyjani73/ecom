const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const sessionGuard = require('../middlewares/sessionGuard');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/logout-all', sessionGuard, authController.logoutAll);

module.exports = router;

