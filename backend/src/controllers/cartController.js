const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ customer: req.user._id }).populate('items.product', 'name images price quantity isAvailable farmer');
    res.json({ cart: cart || { items: [], totalAmount: 0 } });
  } catch (err) { next(err); }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isAvailable) return res.status(404).json({ message: 'Product not available' });
    if (product.quantity < quantity) return res.status(400).json({ message: 'Insufficient stock' });

    let cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) cart = new Cart({ customer: req.user._id, items: [] });

    const existingItem = cart.items.find(i => i.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, price: product.price });
    }
    cart.calcTotal();
    await cart.save();
    await cart.populate('items.product', 'name images price quantity isAvailable');
    res.json({ cart });
  } catch (err) { next(err); }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(i => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    } else {
      item.quantity = quantity;
    }
    cart.calcTotal();
    await cart.save();
    await cart.populate('items.product', 'name images price quantity isAvailable');
    res.json({ cart });
  } catch (err) { next(err); }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    cart.calcTotal();
    await cart.save();
    res.json({ cart });
  } catch (err) { next(err); }
};

exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ customer: req.user._id }, { items: [], totalAmount: 0 });
    res.json({ message: 'Cart cleared' });
  } catch (err) { next(err); }
};
