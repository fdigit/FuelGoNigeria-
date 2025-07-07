import { body, param, query } from 'express-validator';

export const orderValidation = {
  createOrder: [
    body('vendorId').isMongoId().withMessage('Valid vendor ID is required'),
    body('orderItems').isArray({ min: 1 }).withMessage('At least one order item is required'),
    body('orderItems.*.productId').isMongoId().withMessage('Valid product ID is required'),
    body('orderItems.*.quantity').isFloat({ min: 0.1 }).withMessage('Valid quantity is required'),
    body('deliveryAddress').isObject().withMessage('Delivery address is required'),
    body('deliveryAddress.street').optional().isString(),
    body('deliveryAddress.city').isString().withMessage('City is required'),
    body('deliveryAddress.state').isString().withMessage('State is required'),
    body('deliveryAddress.country').optional().isString(),
    body('phoneNumber').isMobilePhone('en-NG').withMessage('Valid Nigerian phone number is required'),
    body('paymentMethod').isIn(['cash', 'card', 'transfer']).withMessage('Valid payment method is required'),
    body('specialInstructions').optional().isString().isLength({ max: 500 })
  ],

  cancelOrder: [
    param('orderId').isMongoId().withMessage('Valid order ID is required'),
    body('reason').optional().isString().isLength({ max: 200 })
  ],

  getOrderSummary: [
    body('vendorId').isMongoId().withMessage('Valid vendor ID is required'),
    body('orderItems').isArray({ min: 1 }).withMessage('At least one order item is required'),
    body('orderItems.*.productId').isMongoId().withMessage('Valid product ID is required'),
    body('orderItems.*.quantity').isFloat({ min: 0.1 }).withMessage('Valid quantity is required')
  ],

  updateOrderStatus: [
    param('orderId').isMongoId().withMessage('Valid order ID is required'),
    body('status').isIn(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'])
      .withMessage('Valid order status is required'),
    body('notes').optional().isString().isLength({ max: 200 })
  ],

  assignDriver: [
    param('orderId').isMongoId().withMessage('Valid order ID is required'),
    body('driverId').isMongoId().withMessage('Valid driver ID is required')
  ],

  updateDelivery: [
    param('orderId').isMongoId().withMessage('Valid order ID is required'),
    body('estimatedDelivery').optional().isISO8601().withMessage('Valid delivery time is required'),
    body('deliveryNotes').optional().isString().isLength({ max: 200 })
  ],

  updateLocation: [
    param('orderId').isMongoId().withMessage('Valid order ID is required'),
    body('location').isObject().withMessage('Location is required'),
    body('location.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
    body('location.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required')
  ],

  adminIntervention: [
    param('orderId').isMongoId().withMessage('Valid order ID is required'),
    body('action').isIn(['force_cancel', 'force_confirm', 'assign_driver', 'update_status', 'refund'])
      .withMessage('Valid admin action is required'),
    body('reason').isString().isLength({ min: 10, max: 500 }).withMessage('Reason is required'),
    body('newStatus').optional().isIn(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']),
    body('driverId').optional().isMongoId()
  ],

  // Query validators for filtering
  getOrders: [
    query('status').optional().isIn(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']),
    query('dateRange').optional().isIn(['today', 'week', 'month', 'year']),
    query('search').optional().isString().isLength({ max: 100 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ]
}; 