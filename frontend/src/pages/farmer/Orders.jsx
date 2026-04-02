import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StatusBadge, Skeleton, EmptyState } from '../../components/ui';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { formatINR } from '../../utils/currency';

const STATUS_OPTIONS = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/orders/farmer').then(res => setOrders(res.data.orders)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status });
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: data.order.status } : o));
      toast.success(`Order marked as ${status}`);
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Incoming Orders</h1>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${filter === s ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="📦" title="No orders" description="Orders will appear here when customers place them" />
        ) : (
          <div className="space-y-4">
            {filtered.map(order => (
              <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <Link to={`/orders/${order._id}`} className="font-mono text-primary-600 hover:underline font-semibold">
                      #{order._id.slice(-8).toUpperCase()}
                    </Link>
                    <p className="text-sm text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="font-bold text-primary-600 text-lg">{formatINR(order.totalAmount)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                    {order.customer?.name?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{order.customer?.name}</p>
                    <p className="text-xs text-gray-500">{order.customer?.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {order.items?.map(item => (
                    <span key={item._id} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {item.name} × {item.quantity}
                    </span>
                  ))}
                </div>

                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.filter(s => {
                      const idx = STATUS_OPTIONS.indexOf(order.status);
                      const sIdx = STATUS_OPTIONS.indexOf(s);
                      return sIdx >= idx || s === 'cancelled';
                    }).map(s => (
                      <motion.button key={s} whileTap={{ scale: 0.95 }}
                        onClick={() => updateStatus(order._id, s)}
                        disabled={order.status === s}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${order.status === s ? 'bg-primary-600 text-white' : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600'}`}>
                        {s}
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
