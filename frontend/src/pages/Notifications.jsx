import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiCheck } from 'react-icons/fi';
import { EmptyState } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/farmers/notifications/me').then(res => setNotifications(res.data.notifications)).finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/farmers/notifications/read');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch {}
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            {unread > 0 && <p className="text-sm text-gray-500 mt-1">{unread} unread</p>}
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-primary-600 hover:underline font-medium">
              <FiCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : notifications.length === 0 ? (
          <EmptyState icon="🔔" title="No notifications" description="You're all caught up!" />
        ) : (
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className={`card p-4 flex items-start gap-3 ${!n.read ? 'border-l-4 border-primary-600' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!n.read ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                  <FiBell size={18} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.read && <div className="w-2 h-2 bg-primary-600 rounded-full mt-1 shrink-0" />}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
