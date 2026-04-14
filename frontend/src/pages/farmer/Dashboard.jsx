import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiShoppingBag, FiClock, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { MdCurrencyRupee } from 'react-icons/md';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { StatusBadge, Skeleton } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { formatINR } from '../../utils/currency';

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed'];

const StatCard = ({ icon, label, value, color, delay, trend }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="card p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        {trend !== undefined && (
          <p className={`text-xs mt-1 flex items-center gap-1 ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend >= 0 ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
            {Math.abs(trend)}% vs last month
          </p>
        )}
      </div>
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-2xl`}>{icon}</div>
    </div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name === 'revenue' ? formatINR(p.value) : `${p.value} orders`}
        </p>
      ))}
    </div>
  );
};

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('revenue');

  useEffect(() => {
    Promise.all([
      api.get('/orders/stats'),
      api.get('/orders/farmer'),
      api.get('/orders/sales-report')
    ]).then(([sRes, oRes, rRes]) => {
      setStats(sRes.data);
      setOrders(oRes.data.orders.slice(0, 5));
      setReport(rRes.data);
    }).finally(() => setLoading(false));
  }, []);

  // Compute trend: compare last month vs previous month
  const getTrend = () => {
    if (!report?.monthlySales || report.monthlySales.length < 2) return undefined;
    const last = report.monthlySales[report.monthlySales.length - 1].revenue;
    const prev = report.monthlySales[report.monthlySales.length - 2].revenue;
    if (!prev) return undefined;
    return Math.round(((last - prev) / prev) * 100);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">{user?.farmName || 'Your Farm'} Dashboard</p>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<FiPackage />} label="Total Products" value={stats?.totalProducts || 0} color="bg-blue-100 text-blue-600" delay={0} />
            <StatCard icon={<FiShoppingBag />} label="Total Orders" value={stats?.totalOrders || 0} color="bg-purple-100 text-purple-600" delay={0.1} />
            <StatCard icon={<MdCurrencyRupee />} label="Total Earnings" value={formatINR(stats?.totalEarnings)} color="bg-green-100 text-green-600" delay={0.2} trend={getTrend()} />
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

        {/* Charts Row */}
        {loading ? (
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-80 lg:col-span-2" />
            <Skeleton className="h-80" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 mb-8">

            {/* Bar / Line Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="card p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sales Report</h2>
                <div className="flex gap-2">
                  {['revenue', 'orders'].map(tab => (
                    <button key={tab} onClick={() => setActiveChart(tab)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${activeChart === tab ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                {activeChart === 'revenue' ? (
                  <BarChart data={report?.monthlySales} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false}
                      tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" name="revenue" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={report?.monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="orders" name="orders" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </motion.div>

            {/* Pie Chart — Order Status */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Status</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={report?.statusData?.filter(d => d.value > 0)} cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {report?.statusData?.filter(d => d.value > 0).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                  <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs capitalize text-gray-600 dark:text-gray-300">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        )}

        {/* Top Products + Recent Orders */}
        {loading ? (
          <div className="grid lg:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Top Products */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Products by Revenue</h2>
              {report?.topProducts?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sales data yet</p>
              ) : (
                <div className="space-y-3">
                  {report?.topProducts?.map((p, i) => {
                    const max = report.topProducts[0].revenue;
                    const pct = Math.round((p.revenue / max) * 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700 dark:text-gray-200 truncate max-w-[60%]">{p.name}</span>
                          <span className="text-gray-500">{formatINR(p.revenue)} · {p.qty} sold</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                            className="h-full rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Recent Orders */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="card p-6">
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
                        <th className="pb-3 font-medium">Order</th>
                        <th className="pb-3 font-medium">Customer</th>
                        <th className="pb-3 font-medium">Amount</th>
                        <th className="pb-3 font-medium">Status</th>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

          </div>
        )}
      </div>
    </div>
  );
}
