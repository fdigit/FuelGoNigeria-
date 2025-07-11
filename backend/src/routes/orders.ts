import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { orderController } from '../controllers/orderController';
import { orderValidation } from '../validators/order';

const router = Router();

// Customer routes
router.post('/', authenticateToken, validateRequest(orderValidation.createOrder), orderController.createOrder);
router.get('/customer', authenticateToken, orderController.getCustomerOrders);
router.get('/:orderId', authenticateToken, orderController.getOrderById);
router.patch('/:orderId/cancel', authenticateToken, validateRequest(orderValidation.cancelOrder), orderController.cancelOrder);
router.post('/summary', authenticateToken, validateRequest(orderValidation.getOrderSummary), orderController.getOrderSummary);

// Vendor routes
router.get('/vendor/orders', authenticateToken, orderController.getVendorOrders);
router.patch('/vendor/orders/:orderId/status', authenticateToken, validateRequest(orderValidation.updateOrderStatus), orderController.updateOrderStatus);
router.patch('/vendor/orders/:orderId/assign-driver', authenticateToken, validateRequest(orderValidation.assignDriver), orderController.assignDriver);
// router.patch('/vendor/orders/:orderId/update-delivery', authenticateToken, validateRequest(orderValidation.updateDelivery), orderController.updateDelivery); // Not implemented

// Driver routes
router.get('/driver/orders', authenticateToken, orderController.getDriverOrders);
router.patch('/driver/orders/:orderId/update-location', authenticateToken, validateRequest(orderValidation.updateLocation), orderController.updateDriverLocation);
router.patch('/driver/orders/:orderId/complete-delivery', authenticateToken, orderController.completeDelivery);

// Admin routes
router.get('/admin/all', authenticateToken, orderController.getAllOrders);
router.patch('/admin/orders/:orderId/intervene', authenticateToken, validateRequest(orderValidation.adminIntervention), orderController.adminIntervention);
router.get('/admin/analytics', authenticateToken, orderController.getOrderAnalytics);

export default router;
