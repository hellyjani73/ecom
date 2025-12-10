const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const sessionGuard = require('../middlewares/sessionGuard');
const adminGuard = require('../middlewares/adminGuard');

// Protected routes - User can access their own orders
router.get('/my-orders', sessionGuard, orderController.getUserOrders);
router.post('/', sessionGuard, orderController.createOrder);
router.get('/:id', sessionGuard, orderController.getOrderById);
router.get('/order-number/:orderNumber', sessionGuard, orderController.getOrderByOrderNumber);
router.put('/:id/cancel', sessionGuard, orderController.cancelOrder);

// Admin routes (Use sessionGuard then adminGuard)
router.get('/', sessionGuard, adminGuard, orderController.getAllOrders);
router.put('/:id', sessionGuard, adminGuard, orderController.updateOrder);
router.delete('/:id', sessionGuard, adminGuard, orderController.deleteOrder);

module.exports = router;

