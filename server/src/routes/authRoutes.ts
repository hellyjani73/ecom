import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import validateRequest, { requireAuth } from '../middleware/middleware';
import { loginValidator, changePasswordSchemaValidator, registerValidator, googleLoginValidator, refreshTokenValidator } from '../validators/vendorValidator';
import { asyncHandler } from '../utils/commonResponse';

const router = Router();
const authController = new AuthController();

// Public routes
router.post(
    '/login',
    validateRequest(loginValidator),
    asyncHandler(authController.loginController.bind(authController))
);

router.post(
    '/register',
    validateRequest(registerValidator),
    asyncHandler(authController.registerController.bind(authController))
);

router.post(
    '/google',
    validateRequest(googleLoginValidator),
    asyncHandler(authController.googleLoginController.bind(authController))
);

router.post(
    '/refresh',
    validateRequest(refreshTokenValidator),
    asyncHandler(authController.refreshTokenController.bind(authController))
);

router.post(
    '/logout',
    asyncHandler(authController.logoutController.bind(authController))
);

// Protected routes
router.post(
    '/changePassword',
    requireAuth,
    validateRequest(changePasswordSchemaValidator),
    asyncHandler(authController.changePasswordController.bind(authController))
);

router.get('/health', (req, res) => {
    res.status(200).json({ message: 'API is running successfully!' });
});

export default router;