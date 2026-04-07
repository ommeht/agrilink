import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/ui';
import { formatINR } from '../utils/currency';
import { imgUrl } from '../utils/config';

export default function Cart() {
  const { cart, updateItem, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (!cart.items?.length) return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EmptyState icon="🛒" title="Your cart is empty" description="Browse fresh products from local farmers"
          action={<Link to="/products" className="btn-primary">Shop Now</Link>} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
            <FiTrash2 size={14} /> Clear All
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.items.map(item => {
                const product = item.product;
                const imageUrl = product?.images?.[0] ? imgUrl(product.images[0]) : `https://placehold.co/80x80/22c55e/white?text=${encodeURIComponent(product?.name || '')}`;
                return (
                  <motion.div key={item._id || item.product?._id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    className="card p-4 flex items-center gap-4">
                    <img src={imageUrl} alt={product?.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{product?.name}</h3>
                      <p className="text-primary-600 font-bold">{formatINR(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                      <button onClick={() => updateItem(product?._id, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center hover:bg-primary-50 transition-colors">
                        <FiMinus size={14} />
                      </button>
                      <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                      <button onClick={() => updateItem(product?._id, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center hover:bg-primary-50 transition-colors">
                        <FiPlus size={14} />
                      </button>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white w-16 text-right">{formatINR(item.price * item.quantity)}</p>
                    <button onClick={() => removeItem(product?._id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                      <FiTrash2 size={16} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="card p-6 h-fit sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({cart.items.length} items)</span>
                <span>{formatINR(cart.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between font-bold text-gray-900 dark:text-white text-lg">
                <span>Total</span>
                <span className="text-primary-600">{formatINR(cart.totalAmount)}</span>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/checkout')}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              Proceed to Checkout <FiArrowRight />
            </motion.button>
            <Link to="/products" className="block text-center text-sm text-primary-600 hover:underline mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
