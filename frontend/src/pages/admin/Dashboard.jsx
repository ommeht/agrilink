import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiPackage, FiShoppingBag, FiDollarSign, FiTrash2 } from 'react-icons/fi';
import { StatusBadge, Skeleton } from '../../components/ui';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { formatINR } from '../../utils/currency';

const StatCard = ({ icon, label, value, color }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-2xl`}>{icon}</div>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/farmers/admin/stats'),
      api.get('/farmers/admin/users'),
      api.get('/farmers/admin/orders')
    ]).then(([sRes, uRes, oRes]) => {
      setStats(sRes.data);
      setUsers(uRes.data.users);
      setOrders(oRes.data.orders);
    }).finally(() => setLoading(false));
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/farmers/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard icon={<FiUsers />} label="Customers" value={stats?.totalUsers || 0} color="bg-blue-100 text-blue-600" />
            <StatCard icon="👨‍🌾" label="Farmers" value={stats?.totalFarmers || 0} color="bg-green-100 text-green-600" />
            <StatCard icon={<FiPackage />} label="Products" value={stats?.totalProducts || 0} color="bg-purple-100 text-purple-600" />
            <StatCard icon={<FiShoppingBag />} label="Orders" value={stats?.totalOrders || 0} color="bg-yellow-100 text-yellow-600" />
            <StatCard icon={<FiDollarSign />} label="Revenue" value={formatINR(stats?.totalRevenue)} color="bg-emerald-100 text-emerald-600" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['users', 'orders'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl font-medium capitalize transition-all ${tab === t ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr className="text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                            {user.name[0]}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`badge capitalize ${user.role === 'farmer' ? 'bg-green-100 text-green-700' : user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteUser(user._id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr className="text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">Order ID</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Farmer</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {orders.map(order => (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-primary-600">#{order._id.slice(-6).toUpperCase()}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.customer?.name}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.farmer?.farmName || order.farmer?.name}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{formatINR(order.totalAmount)}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
