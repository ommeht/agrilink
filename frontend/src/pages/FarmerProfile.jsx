import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiPhone, FiEdit2, FiTrash2, FiSend } from 'react-icons/fi';
import { ProductCard, StarRating, Skeleton } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function FarmerProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    api.get(`/farmers/${id}`)
      .then(res => {
        setData(res.data);
        setReviews(res.data.reviews || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Check if logged-in customer can review this farmer
  useEffect(() => {
    if (user?.role !== 'customer' || !id) return;
    api.get('/orders/my').then(res => {
      const hasDelivered = res.data.orders.some(
        o => o.farmer?._id === id && o.status === 'delivered'
      );
      setCanReview(hasDelivered);
    }).catch(() => {});
  }, [user, id]);

  // Find if customer already left a review
  useEffect(() => {
    if (!user || reviews.length === 0) return;
    const existing = reviews.find(r => r.customer?._id === user._id || r.customer?._id?.toString() === user._id?.toString());
    if (existing) {
      setMyReview(existing);
      setRating(existing.rating);
      setComment(existing.comment);
    }
  }, [reviews, user]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error('Please write a comment');
    setSubmitting(true);
    try {
      const { data: res } = await api.post(`/reviews/farmer/${id}`, { rating, comment });
      toast.success(res.updated ? 'Review updated!' : 'Review submitted! 🎉');
      setMyReview(res.review);
      setEditing(false);
      // Update reviews list
      setReviews(prev => {
        const exists = prev.find(r => r._id === res.review._id);
        if (exists) return prev.map(r => r._id === res.review._id ? res.review : r);
        return [res.review, ...prev];
      });
      // Refresh avg rating
      api.get(`/farmers/${id}`).then(r => setData(r.data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  const deleteMyReview = async () => {
    if (!window.confirm('Delete your review?')) return;
    try {
      await api.delete(`/reviews/${myReview._id}`);
      setReviews(prev => prev.filter(r => r._id !== myReview._id));
      setMyReview(null);
      setRating(5);
      setComment('');
      toast.success('Review deleted');
      api.get(`/farmers/${id}`).then(r => setData(r.data));
    } catch { toast.error('Failed to delete review'); }
  };

  // Average from current reviews list
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  if (loading) return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-48" />
        <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      </div>
    </div>
  );

  if (!data) return <div className="min-h-screen pt-20 flex items-center justify-center text-gray-500">Farmer not found</div>;

  const { farmer, products } = data;

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card p-8 mb-8 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center text-4xl font-bold shrink-0 overflow-hidden">
              {farmer.avatar
                ? <img src={`http://localhost:5000${farmer.avatar}`} alt={farmer.name} className="w-full h-full object-cover" />
                : farmer.name[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{farmer.farmName || farmer.name}</h1>
              <p className="text-primary-100 mt-1">{farmer.name}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-primary-100 text-sm">
                {farmer.farmLocation && <span className="flex items-center gap-1"><FiMapPin size={14} />{farmer.farmLocation}</span>}
                {farmer.phone && <span className="flex items-center gap-1"><FiPhone size={14} />{farmer.phone}</span>}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <StarRating rating={avgRating} size="md" />
                <span className="text-white font-semibold">{avgRating.toFixed(1)}</span>
                <span className="text-primary-200 text-sm">({reviews.length} reviews)</span>
              </div>
            </div>
          </div>
          {farmer.farmDescription && (
            <p className="mt-4 text-primary-100 leading-relaxed">{farmer.farmDescription}</p>
          )}
        </motion.div>

        {/* Products */}
        {products.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Products by {farmer.farmName || farmer.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(p => <ProductCard key={p._id} product={{ ...p, farmer }} />)}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Customer Reviews
              {reviews.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-400">({reviews.length})</span>
              )}
            </h2>
            {/* Overall rating summary */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={avgRating} size="md" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* ── Write / Edit Review Form ── */}
          {user?.role === 'customer' && (canReview || myReview) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-5 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800">

              {myReview && !editing ? (
                // Show existing review with edit/delete
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-gray-900 dark:text-white">Your Review</p>
                    <div className="flex gap-2">
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditing(true)}
                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium px-3 py-1.5 rounded-lg border border-primary-200 hover:bg-primary-100 transition-colors">
                        <FiEdit2 size={13} /> Edit
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={deleteMyReview}
                        className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
                        <FiTrash2 size={13} /> Delete
                      </motion.button>
                    </div>
                  </div>
                  <StarRating rating={myReview.rating} size="md" />
                  <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm leading-relaxed">{myReview.comment}</p>
                </div>
              ) : (
                // Review form
                <form onSubmit={submitReview} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {myReview ? 'Edit Your Review' : 'Rate this Farmer'}
                    </p>
                    {editing && (
                      <button type="button" onClick={() => { setEditing(false); setRating(myReview.rating); setComment(myReview.comment); }}
                        className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                    )}
                  </div>

                  {/* Star selector */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Rating</p>
                    <div className="flex items-center gap-3">
                      <StarRating rating={rating} size="lg" interactive onRate={setRating} />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                      </span>
                    </div>
                  </div>

                  {/* Rating breakdown labels */}
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <motion.button key={s} type="button" whileTap={{ scale: 0.9 }}
                        onClick={() => setRating(s)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${rating === s ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-primary-400'}`}>
                        {s}★
                      </motion.button>
                    ))}
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Review</p>
                    <textarea value={comment} onChange={e => setComment(e.target.value)}
                      className="input resize-none" rows={4}
                      placeholder="Share your experience with this farmer — quality of produce, freshness, communication, delivery..." required />
                    <p className="text-xs text-gray-400 mt-1">{comment.length}/500 characters</p>
                  </div>

                  <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={submitting || !comment.trim()}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50">
                    {submitting
                      ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <FiSend size={15} />}
                    {submitting ? 'Submitting...' : myReview ? 'Update Review' : 'Submit Review'}
                  </motion.button>
                </form>
              )}
            </motion.div>
          )}

          {/* Not eligible notice */}
          {user?.role === 'customer' && !canReview && !myReview && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-500">
                🛒 You can review this farmer after receiving a delivered order from them.
              </p>
            </div>
          )}

          {/* Not logged in notice */}
          {!user && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-500">
                Please <a href="/login" className="text-primary-600 font-semibold hover:underline">login</a> to leave a review.
              </p>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, i) => (
                <motion.div key={review._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex gap-4 p-4 rounded-xl border transition-all ${review.customer?._id?.toString() === user?._id?.toString() ? 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10' : 'border-gray-100 dark:border-gray-800'}`}>
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                    {review.customer?.avatar
                      ? <img src={`http://localhost:5000${review.customer.avatar}`} alt="" className="w-full h-full object-cover" />
                      : review.customer?.name?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{review.customer?.name}</p>
                        {review.customer?._id?.toString() === user?._id?.toString() && (
                          <span className="badge bg-primary-100 text-primary-700 text-xs">You</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm leading-relaxed">{review.comment}</p>
                    {review.product?.name && (
                      <p className="text-xs text-primary-600 mt-1.5">📦 Ordered: {review.product.name}</p>
                    )}
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
