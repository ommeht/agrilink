const router = require('express').Router();
const {
  getFarmers, getFarmerProfile, toggleWishlist, getWishlist,
  getNotifications, markNotificationsRead,
  adminGetStats, adminGetUsers, adminDeleteUser, adminGetOrders
} = require('../controllers/farmerController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/', getFarmers);
router.get('/:id', getFarmerProfile);

// Customer
router.post('/wishlist/:productId', protect, authorize('customer'), toggleWishlist);
router.get('/wishlist/me', protect, authorize('customer'), getWishlist);

// Notifications (all roles)
router.get('/notifications/me', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);

// Admin
router.get('/admin/stats', protect, authorize('admin'), adminGetStats);
router.get('/admin/users', protect, authorize('admin'), adminGetUsers);
router.delete('/admin/users/:id', protect, authorize('admin'), adminDeleteUser);
router.get('/admin/orders', protect, authorize('admin'), adminGetOrders);

module.exports = router;
