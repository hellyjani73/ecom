import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { requireAuth, requireAdmin } from '../middleware/middleware';

const router = Router();
const orderController = new OrderController();

// Create order (authenticated users)
router.post('/', requireAuth, orderController.createOrder.bind(orderController));

// Admin routes (require admin role)
router.get('/', requireAuth, requireAdmin, orderController.getAllOrders.bind(orderController));
router.get('/:id', requireAuth, requireAdmin, orderController.getOrderById.bind(orderController));
router.put('/:id', requireAuth, requireAdmin, orderController.updateOrder.bind(orderController));

export default router;

