const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'No order items' });

    let totalAmount = 0;
    const orderItems = [];
    let farmerId = null;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: `Product ${item.product} not found` });
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      if (!farmerId) farmerId = product.farmer;
      orderItems.push({ product: product._id, name: product.name, image: product.images[0] || '', price: product.price, quantity: item.quantity });
      totalAmount += product.price * item.quantity;
      await Product.findByIdAndUpdate(product._id, { $inc: { quantity: -item.quantity } });
    }

    const order = await Order.create({
      customer: req.user._id, farmer: farmerId, items: orderItems,
      totalAmount, shippingAddress, paymentMethod, notes
    });

    await Cart.findOneAndUpdate(
      { customer: req.user._id },
      { $set: { items: [], totalAmount: 0 } },
      { upsert: true }
    );

    const User = require('../models/User');
    await User.findByIdAndUpdate(farmerId, {
      $push: { notifications: { message: `New order #${order._id.toString().slice(-6)} received!` } }
    });

    res.status(201).json({ order });
  } catch (err) { next(err); }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('farmer', 'name farmName avatar')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) { next(err); }
};

exports.getFarmerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ farmer: req.user._id })
      .populate('customer', 'name email avatar phone')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) { next(err); }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) return res.status(400).json({ message: 'Cancellation reason is required' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only the customer who placed the order can cancel
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Can only cancel if pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: `Cannot cancel an order that is already ${order.status}` });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { quantity: item.quantity } });
    }

    order.status = 'cancelled';
    order.cancellationReason = reason.trim();
    order.cancelledAt = new Date();
    await order.save();

    // Notify farmer
    const User = require('../models/User');
    await User.findByIdAndUpdate(order.farmer, {
      $push: { notifications: { message: `Order #${order._id.toString().slice(-6)} was cancelled by customer. Reason: ${reason}` } }
    });

    res.json({ order, message: 'Order cancelled successfully' });
  } catch (err) { next(err); }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    order.status = status;
    if (status === 'delivered') { order.isDelivered = true; order.deliveredAt = Date.now(); }
    await order.save();

    const User = require('../models/User');
    await User.findByIdAndUpdate(order.customer, {
      $push: { notifications: { message: `Your order #${order._id.toString().slice(-6)} is now ${status}` } }
    });

    res.json({ order });
  } catch (err) { next(err); }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('farmer', 'name farmName phone')
      .populate('items.product', 'name images');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const customerId = order.customer?._id?.toString();
    const farmerId = order.farmer?._id?.toString();
    const userId = req.user._id.toString();

    const isOwner = customerId === userId || farmerId === userId;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json({ order });
  } catch (err) { next(err); }
};

exports.getFarmerStats = async (req, res, next) => {
  try {
    const Product = require('../models/Product');
    const [totalProducts, orders] = await Promise.all([
      Product.countDocuments({ farmer: req.user._id }),
      Order.find({ farmer: req.user._id })
    ]);
    const totalOrders = orders.length;
    const totalEarnings = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    res.json({ totalProducts, totalOrders, totalEarnings, pendingOrders });
  } catch (err) { next(err); }
};
