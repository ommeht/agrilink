const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

// Get all farmers with their average ratings
exports.getFarmers = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search } = req.query;
    const query = { role: 'farmer' };
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { farmName: { $regex: search, $options: 'i' } },
      { farmLocation: { $regex: search, $options: 'i' } }
    ];
    const total = await User.countDocuments(query);
    const farmers = await User.find(query)
      .select('-password -notifications')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Attach avg rating from reviews
    const farmersWithRating = await Promise.all(farmers.map(async (farmer) => {
      const reviews = await Review.find({ farmer: farmer._id });
      const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
      return { ...farmer.toObject(), avgRating: Math.round(avgRating * 10) / 10, totalReviews: reviews.length };
    }));

    res.json({ farmers: farmersWithRating, total, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getFarmerProfile = async (req, res, next) => {
  try {
    const farmer = await User.findOne({ _id: req.params.id, role: 'farmer' }).select('-password -notifications');
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    const [products, reviews] = await Promise.all([
      Product.find({ farmer: farmer._id, isAvailable: true }).limit(8),
      Review.find({ farmer: farmer._id }).populate('customer', 'name avatar').populate('product', 'name').limit(10)
    ]);
    const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    res.json({ farmer: { ...farmer.toObject(), avgRating: Math.round(avgRating * 10) / 10 }, products, reviews });
  } catch (err) { next(err); }
};

// Wishlist
exports.toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;
    const idx = user.wishlist.indexOf(productId);
    if (idx > -1) user.wishlist.splice(idx, 1);
    else user.wishlist.push(productId);
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err) { next(err); }
};

exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ wishlist: user.wishlist });
  } catch (err) { next(err); }
};

// Notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    res.json({ notifications: user.notifications.reverse() });
  } catch (err) { next(err); }
};

exports.markNotificationsRead = async (req, res, next) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $set: { 'notifications.$[].read': true } });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

// Admin
exports.adminGetStats = async (req, res, next) => {
  try {
    const [totalUsers, totalFarmers, totalProducts, totalOrders, orders] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'farmer' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.find()
    ]);
    const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0);
    res.json({ totalUsers, totalFarmers, totalProducts, totalOrders, totalRevenue });
  } catch (err) { next(err); }
};

exports.adminGetUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) { next(err); }
};

exports.adminDeleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};

exports.adminGetOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('farmer', 'name farmName')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) { next(err); }
};
