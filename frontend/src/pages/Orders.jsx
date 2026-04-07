import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiX, FiAlertTriangle, FiCheckCircle, FiTruck, FiPackage, FiRefreshCw } from 'react-icons/fi';
import { StatusBadge, EmptyState, Skeleton } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatINR } from '../utils/currency';
import { imgUrl } from '../utils/config';
import toast from 'react-hot-toast';

const CANCEL_REASONS = [
  'Changed my mind', 'Ordered by mistake', 'Found a better price elsewhere',
  'Delivery time is too long', 'Product no longer needed', 'Other'
];

function CancelModal({ orderId, onClose, onCancelled }) {
  const [reason, setReason] = useState('');
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const finalReason = reason === 'Other' ? custom : reason;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!finalReason.trim()) return toast.error('Please select or enter a reason');
    setLoading(true);
    try {
      const { data } = await api.put(`/orders/${orderId}/cancel`, { reason: finalReason });
      toast.success('Order cancelled successfully');
      onCancelled(data.order);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
          onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <FiAlertTriangle className="text-red-500" size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Cancel Order</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <FiX size={18} className="text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-5">Please tell us why you want to cancel.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {CANCEL_REASONS.map(r => (
                <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${reason === r ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-red-300'}`}>
                  <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="accent-red-500" />
                  <span className={`text-sm font-medium ${reason === r ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>{r}</span>
                </label>
              ))}
            </div>
            {reason === 'Other' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <textarea value={custom} onChange={e => setCustom(e.target.value)} className="input resize-none" rows={3} placeholder="Please describe your reason..." required />
              </motion.div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Keep Order</button>
              <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading || !reason}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Cancel Order'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    api.get('/orders/my').then(res => setOrders(res.data.orders)).finally(() => setLoading(false));
  }, []);

  const handleCancelled = (updatedOrder) => {
    setOrders(orders.map(o => o._id === updatedOrder._id ? { ...o, status: 'cancelled' } : o));
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Orders</h1>
        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
        ) : orders.length === 0 ? (
          <EmptyState icon="📦" title="No orders yet" description="Start shopping to see your orders here"
            action={<Link to="/products" className="btn-primary">Shop Now</Link>} />
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm text-gray-500">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="font-bold text-primary-600">{formatINR(order.totalAmount)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  {order.items?.slice(0, 3).map(item => (
                    <div key={item._id} className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {item.image
                        ? <img src={imgUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>}
                    </div>
                  ))}
                  {order.items?.length > 3 && <span className="text-sm text-gray-500">+{order.items.length - 3} more</span>}
                </div>
                {order.status === 'cancelled' && order.cancellationReason && (
                  <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                    <p className="text-xs text-red-600 dark:text-red-400"><span className="font-semibold">Cancelled:</span> {order.cancellationReason}</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">From: {order.farmer?.farmName || order.farmer?.name}</p>
                  <div className="flex items-center gap-3">
                    {['pending', 'confirmed'].includes(order.status) && (
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setCancellingId(order._id)}
                        className="text-sm text-red-500 hover:text-red-700 font-medium border border-red-200 hover:border-red-400 px-3 py-1 rounded-lg transition-colors">
                        Cancel
                      </motion.button>
                    )}
                    <Link to={`/orders/${order._id}`} className="text-primary-600 text-sm font-medium hover:underline">View Details →</Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {cancellingId && <CancelModal orderId={cancellingId} onClose={() => setCancellingId(null)} onCancelled={handleCancelled} />}
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then(res => setOrder(res.data.order)).finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (status) => {
    setUpdatingStatus(true);
    try {
      const { data } = await api.put(`/orders/${id}/status`, { status });
      setOrder(prev => ({ ...prev, status: data.order.status, isDelivered: data.order.isDelivered, deliveredAt: data.order.deliveredAt }));
      toast.success(`Order marked as ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally { setUpdatingStatus(false); }
  };

  if (loading) return <div className="min-h-screen pt-20 flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!order) return <div className="min-h-screen pt-20 flex items-center justify-center text-gray-500">Order not found</div>;

  const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStep = steps.indexOf(order.status);
  const canCancel = ['pending', 'confirmed'].includes(order.status) && user?.role === 'customer';
  const isFarmer = user?.role === 'farmer';

  const STATUS_FLOW = {
    pending: [{ value: 'confirmed', label: 'Confirm Order', icon: <FiCheckCircle />, color: 'bg-blue-500 hover:bg-blue-600' }],
    confirmed: [{ value: 'processing', label: 'Start Processing', icon: <FiRefreshCw />, color: 'bg-purple-500 hover:bg-purple-600' }],
    processing: [{ value: 'shipped', label: 'Mark as Shipped', icon: <FiTruck />, color: 'bg-indigo-500 hover:bg-indigo-600' }],
    shipped: [{ value: 'delivered', label: 'Mark as Delivered', icon: <FiCheckCircle />, color: 'bg-green-500 hover:bg-green-600' }],
    delivered: [], cancelled: []
  };
  const nextStatuses = STATUS_FLOW[order.status] || [];

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/orders" className="flex items-center gap-2 text-primary-600 hover:underline mb-6"><FiArrowLeft size={16} /> Back to Orders</Link>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            {canCancel && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowCancel(true)}
                className="text-sm text-red-500 hover:text-red-700 font-semibold border-2 border-red-200 hover:border-red-400 px-4 py-1.5 rounded-xl transition-colors">
                Cancel Order
              </motion.button>
            )}
          </div>
        </div>

        {order.status === 'cancelled' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="card p-5 mb-6 border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="text-red-500 mt-0.5 shrink-0" size={20} />
              <div>
                <p className="font-semibold text-red-700 dark:text-red-400">Order Cancelled</p>
                {order.cancellationReason && <p className="text-sm text-red-600 dark:text-red-300 mt-1">Reason: {order.cancellationReason}</p>}
                {order.cancelledAt && <p className="text-xs text-red-400 mt-1">Cancelled on {new Date(order.cancelledAt).toLocaleString()}</p>}
              </div>
            </div>
          </motion.div>
        )}

        {order.status !== 'cancelled' && (
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />
              <div className="absolute top-4 left-0 h-0.5 bg-primary-600 z-0 transition-all duration-500" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} />
              {steps.map((step, i) => (
                <div key={step} className="flex flex-col items-center z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <span className="text-xs mt-1 capitalize text-gray-500 hidden sm:block">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isFarmer && nextStatuses.length > 0 && order.status !== 'cancelled' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="card p-5 mb-6 border-2 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
            <div className="flex items-center gap-2 mb-4">
              <FiPackage className="text-primary-600" size={20} />
              <h3 className="font-semibold text-gray-900 dark:text-white">Update Order Status</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {nextStatuses.map(({ value, label, icon, color }) => (
                <motion.button key={value} whileTap={{ scale: 0.95 }} onClick={() => handleStatusUpdate(value)} disabled={updatingStatus}
                  className={`flex items-center gap-2 ${color} text-white font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-md hover:shadow-lg`}>
                  {updatingStatus ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : icon}
                  {label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Shipping Address</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {order.shippingAddress?.street}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
            </p>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Farmer</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{order.farmer?.farmName || order.farmer?.name}<br />{order.farmer?.phone}</p>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Items</h3>
          <div className="space-y-3 mb-4">
            {order.items?.map(item => (
              <div key={item._id} className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                  {item.image
                    ? <img src={imgUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatINR(item.price)}</p>
                </div>
                <p className="font-bold text-gray-900 dark:text-white">{formatINR(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-gray-800">
            <span>Total</span>
            <span className="text-primary-600">{formatINR(order.totalAmount)}</span>
          </div>
        </div>
      </div>
      {showCancel && <CancelModal orderId={order._id} onClose={() => setShowCancel(false)} onCancelled={(updated) => setOrder({ ...order, ...updated })} />}
    </div>
  );
}
