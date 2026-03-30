const router = require('express').Router();
const { createReview, createFarmerReview, getProductReviews, getFarmerReviews, deleteReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/product/:productId', protect, authorize('customer'), createReview);
router.post('/farmer/:farmerId', protect, authorize('customer'), createFarmerReview);
router.get('/product/:productId', getProductReviews);
router.get('/farmer/:farmerId', getFarmerReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
