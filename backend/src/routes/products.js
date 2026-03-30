const router = require('express').Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getFarmerProducts } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/my', protect, authorize('farmer'), getFarmerProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('farmer'), upload.array('images', 5), createProduct);
router.put('/:id', protect, authorize('farmer'), upload.array('images', 5), updateProduct);
router.delete('/:id', protect, authorize('farmer', 'admin'), deleteProduct);

module.exports = router;
