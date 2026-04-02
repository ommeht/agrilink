import { motion } from 'framer-motion';
import { FiStar, FiShoppingCart, FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { formatINR } from '../../utils/currency';
import toast from 'react-hot-toast';
import { useState } from 'react';

// Loading Skeleton
export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

export const ProductCardSkeleton = () => (
  <div className="card p-4 space-y-3">
    <Skeleton className="h-48 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex justify-between">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
);

// Star Rating
export const StarRating = ({ rating = 0, size = 'sm', interactive = false, onRate }) => {
  const [hover, setHover] = useState(0);
  const sizes = { sm: 14, md: 18, lg: 22 };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <motion.button key={star} whileHover={interactive ? { scale: 1.2 } : {}} whileTap={interactive ? { scale: 0.9 } : {}}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'}`}
          type="button">
          <FiStar
            size={sizes[size]}
            className={`${(hover || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} transition-colors`}
          />
        </motion.button>
      ))}
    </div>
  );
};

// Product Card
export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login first');
    try {
      await api.post(`/farmers/wishlist/${product._id}`);
      setWishlisted(w => !w);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch {}
  };

  const imageUrl = product.images?.[0] ? `http://localhost:5000${product.images[0]}` : `https://placehold.co/400x300/22c55e/white?text=${encodeURIComponent(product.name)}`;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
      className="card group cursor-pointer">
      <Link to={`/products/${product._id}`}>
        <div className="relative overflow-hidden h-48">
          <img src={imageUrl} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {product.isOrganic && (
            <span className="absolute top-2 left-2 badge bg-primary-100 text-primary-700">🌿 Organic</span>
          )}
          <button onClick={handleWishlist}
            className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
            <FiHeart size={16} className={wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'} />
          </button>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <Link to={`/products/${product._id}`}>
            <h3 className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 transition-colors line-clamp-1">{product.name}</h3>
          </Link>
          <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 capitalize ml-2 shrink-0">{product.category}</span>
        </div>
        <Link to={`/farmers/${product.farmer?._id}`} className="text-xs text-primary-600 hover:underline">
          {product.farmer?.farmName || product.farmer?.name}
        </Link>
        <div className="flex items-center gap-1 mt-1">
          <StarRating rating={product.averageRating} size="sm" />
          <span className="text-xs text-gray-500">({product.numReviews})</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-primary-600">{formatINR(product.price)}</span>
            <span className="text-xs text-gray-500 ml-1">/{product.unit}</span>
          </div>
          {user?.role === 'customer' && (
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => addToCart(product._id)}
              className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
              <FiShoppingCart size={14} /> Add
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Page transition wrapper
export const PageWrapper = ({ children }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
    {children}
  </motion.div>
);

// Empty state
export const EmptyState = ({ icon, title, description, action }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-500 mb-6 max-w-sm">{description}</p>
    {action}
  </motion.div>
);

// Status Badge
export const StatusBadge = ({ status }) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  };
  return <span className={`badge ${colors[status] || 'bg-gray-100 text-gray-700'} capitalize`}>{status}</span>;
};
