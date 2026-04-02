import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiMinus, FiPlus, FiMapPin, FiCalendar } from 'react-icons/fi';
import { StarRating } from '../components/ui';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/products/${id}`),
      api.get(`/reviews/product/${id}`)
    ]).then(([pRes, rRes]) => {
      setProduct(pRes.data.product);
      setReviews(rRes.data.reviews);
    }).finally(() => setLoading(false));
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post(`/reviews/product/${id}`, reviewForm);
      setReviews([data.review, ...reviews]);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return <div className="min-h-screen pt-20 flex items-center justify-center text-gray-500">Product not found</div>;

  const imageUrl = (img) => img ? `http://localhost:5000${img}` : `https://placehold.co/600x400/22c55e/white?text=${encodeURIComponent(product.name)}`;

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-10 mb-12">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 aspect-square mb-3">
              <img src={imageUrl(product.images?.[activeImg])} alt={product.name}
                className="w-full h-full object-cover" />
              {product.isOrganic && (
                <span className="absolute top-4 left-4 badge bg-primary-100 text-primary-700 text-sm px-3 py-1">🌿 Organic</span>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary-600' : 'border-transparent'}`}>
                    <img src={imageUrl(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div>
              <span className="badge bg-primary-100 text-primary-700 capitalize mb-2">{product.category}</span>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
            </div>

            <div className="flex items-center gap-3">
              <StarRating rating={product.averageRating} size="md" />
              <span className="text-gray-500 text-sm">({product.numReviews} reviews)</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary-600">{formatINR(product.price)}</span>
              <span className="text-gray-500">/{product.unit}</span>
            </div>

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {product.harvestDate && (
                <span className="flex items-center gap-1"><FiCalendar size={14} /> Harvested: {new Date(product.harvestDate).toLocaleDateString()}</span>
              )}
              <span className={`font-medium ${product.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.quantity > 0 ? `${product.quantity} ${product.unit} available` : 'Out of stock'}
              </span>
            </div>

            {/* Farmer Info */}
            <Link to={`/farmers/${product.farmer?._id}`}
              className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                {product.farmer?.name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{product.farmer?.farmName || product.farmer?.name}</p>
                {product.farmer?.farmLocation && (
                  <p className="text-xs text-gray-500 flex items-center gap-1"><FiMapPin size={10} />{product.farmer.farmLocation}</p>
                )}
              </div>
            </Link>

            {/* Add to Cart */}
            {user?.role === 'customer' && product.quantity > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center hover:bg-primary-50 transition-colors">
                    <FiMinus size={16} />
                  </button>
                  <span className="w-8 text-center font-semibold">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.quantity, qty + 1))} className="w-9 h-9 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center hover:bg-primary-50 transition-colors">
                    <FiPlus size={16} />
                  </button>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => addToCart(product._id, qty)}
                  className="btn-primary flex items-center gap-2 flex-1 justify-center py-3">
                  <FiShoppingCart size={18} /> Add to Cart
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Reviews */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Customer Reviews</h2>

          {user?.role === 'customer' && (
            <form onSubmit={submitReview} className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Write a Review</h3>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Rating</label>
                <StarRating rating={reviewForm.rating} size="lg" interactive onRate={r => setReviewForm({ ...reviewForm, rating: r })} />
              </div>
              <textarea value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="input resize-none" rows={3} placeholder="Share your experience..." required />
              <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </motion.button>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <motion.div key={review._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex gap-4 p-4 border border-gray-100 dark:border-gray-800 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold shrink-0">
                    {review.customer?.name?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{review.customer?.name}</p>
                      <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">{review.comment}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
