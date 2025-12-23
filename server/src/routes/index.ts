import { Router } from 'express';
import authRoutes from './authRoutes';
import categoryRoutes from './categoryRoutes';
import productRoutes from './productRoutes';
import brandRoutes from './brandRoutes';
import orderRoutes from './orderRoutes';
import analyticsRoutes from './analyticsRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/category', categoryRoutes);
router.use('/product', productRoutes);
router.use('/brand', brandRoutes);
router.use('/order', orderRoutes);
router.use('/analytics', analyticsRoutes);

export default router;

