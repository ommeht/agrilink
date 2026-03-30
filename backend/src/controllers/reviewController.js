const Review = require('../models/Review');
const Order = require('../models/Order');

exports.createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    const Product = require('../models/Product');
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const hasOrdered = await Order.findOne({
      customer: req.user._id,
      'items.product': productId,
      status: 'delivered'
    });
    if (!hasOrdered) return res.status(400).json({ message: 'You can only review products you have purchased' });

    const existing = await Review.findOne({ customer: req.user._id, product: productId });
    if (existing) return res.status(400).json({ message: 'You already reviewed this product' });

    const review = await Review.create({
      customer: req.user._id, product: productId,
      farmer: product.farmer, rating, comment
    });
    await review.populate('customer', 'name avatar');
    res.status(201).json({ review });
  } catch (err) { next(err); }
};

// Direct farmer review — customer must have at least one delivered order from this farmer
exports.createFarmerReview = async (req, res, next) => {
  try {
    const { farmerId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment?.trim()) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    // Must have a delivered order from this farmer
    const deliveredOrder = await Order.findOne({
      customer: req.user._id,
      farmer: farmerId,
      status: 'delivered'
    }).populate('items.product', '_id');

    if (!deliveredOrder) {
      return res.status(400).json({ message: 'You can only review farmers you have received a delivery from' });
    }

    // Use the first product from that order as the product reference
    const productId = deliveredOrder.items[0]?.product?._id;

    // Check if already reviewed this farmer via this product
    const existing = await Review.findOne({ customer: req.user._id, farmer: farmerId, product: productId });
    if (existing) {
      // Update existing review instead
      existing.rating = rating;
      existing.comment = comment.trim();
      await existing.save();
      await existing.populate('customer', 'name avatar');
      await existing.populate('product', 'name images');
      return res.json({ review: existing, updated: true });
    }

    const review = await Review.create({
      customer: req.user._id,
      product: productId,
      farmer: farmerId,
      rating,
      comment: comment.trim()
    });
    await review.populate('customer', 'name avatar');
    await review.populate('product', 'name images');
    res.status(201).json({ review });
  } catch (err) { next(err); }
};

exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) { next(err); }
};

exports.getFarmerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ farmer: req.params.farmerId })
      .populate('customer', 'name avatar')
      .populate('product', 'name images')
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) { next(err); }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (err) { next(err); }
};

exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) { next(err); }
};

exports.getFarmerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ farmer: req.params.farmerId })
      .populate('customer', 'name avatar')
      .populate('product', 'name images')
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) { next(err); }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (err) { next(err); }
};
