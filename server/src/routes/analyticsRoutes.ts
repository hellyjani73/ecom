import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { requireAuth, requireAdmin } from '../middleware/middleware';

const router = Router();
const analyticsController = new AnalyticsController();

// All routes require admin authentication
router.get('/most-selling-products', requireAuth, requireAdmin, analyticsController.getMostSellingProducts.bind(analyticsController));
router.get('/recent-orders', requireAuth, requireAdmin, analyticsController.getRecentOrders.bind(analyticsController));
router.get('/weekly-top-customers', requireAuth, requireAdmin, analyticsController.getWeeklyTopCustomers.bind(analyticsController));
router.get('/dashboard-stats', requireAuth, requireAdmin, analyticsController.getDashboardStats.bind(analyticsController));

export default router;

