const router = require('express').Router();
const { createOrder, getMyOrders, getFarmerOrders, updateOrderStatus, getOrderById, getFarmerStats, getFarmerSalesReport, cancelOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('customer'), createOrder);
router.get('/my', protect, authorize('customer'), getMyOrders);
router.get('/farmer', protect, authorize('farmer'), getFarmerOrders);
router.get('/stats', protect, authorize('farmer'), getFarmerStats);
router.get('/sales-report', protect, authorize('farmer'), getFarmerSalesReport);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, authorize('farmer', 'admin'), updateOrderStatus);
router.put('/:id/cancel', protect, authorize('customer'), cancelOrder);

module.exports = router;
