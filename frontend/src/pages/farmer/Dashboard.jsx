import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiShoppingBag, FiClock } from 'react-icons/fi';
import { MdCurrencyRupee } from 'react-icons/md';
import { StatusBadge, Skeleton } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { formatINR } from '../../utils/currency';

const StatCard = ({ icon, label, value, color, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="card p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-2xl`}>{icon}</div>
    </div>
  </motion.div>
);

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/orders/stats'),
      api.get('/orders/farmer')
    ]).then(([sRes, oRes]) => {
      setStats(sRes.data);
      setOrders(oRes.data.orders.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">{user?.farmName || 'Your Farm'} Dashboard</p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<FiPackage />} label="Total Products" value={stats?.totalProducts || 0} color="bg-blue-100 text-blue-600" delay={0} />
            <StatCard icon={<FiShoppingBag />} label="Total Orders" value={stats?.totalOrders || 0} color="bg-purple-100 text-purple-600" delay={0.1} />
            <StatCard icon={<MdCurrencyRupee />} label="Total Earnings" value={formatINR(stats?.totalEarnings)} color="bg-green-100 text-green-600" delay={0.2} />
            <StatCard icon={<FiClock />} label="Pending Orders" value={stats?.pendingOrders || 0} color="bg-yellow-100 text-yellow-600" delay={0.3} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { to: '/farmer/products/new', label: '+ Add Product', color: 'btn-primary' },
            { to: '/farmer/products', label: 'Manage Products', color: 'btn-outline' },
            { to: '/farmer/orders', label: 'View All Orders', color: 'btn-outline' }
          ].map(action => (
            <Link key={action.to} to={action.to}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`${action.color} w-full py-3`}>
                {action.label}
              </motion.button>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h2>
            <Link to="/farmer/orders" className="text-primary-600 text-sm hover:underline">View all</Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                    <th className="pb-3 font-medium">Order ID</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {orders.map(order => (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-3">
                        <Link to={`/orders/${order._id}`} className="text-primary-600 hover:underline font-mono">
                          #{order._id.slice(-6).toUpperCase()}
                        </Link>
                      </td>
                      <td className="py-3 text-gray-700 dark:text-gray-300">{order.customer?.name}</td>
                      <td className="py-3 font-semibold text-gray-900 dark:text-white">{formatINR(order.totalAmount)}</td>
                      <td className="py-3"><StatusBadge status={order.status} /></td>
                      <td className="py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
