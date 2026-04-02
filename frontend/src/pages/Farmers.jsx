import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiStar } from 'react-icons/fi';
import { Skeleton, EmptyState } from '../components/ui';
import api from '../utils/api';

export const FarmerCard = ({ farmer }) => (
  <motion.div whileHover={{ y: -4 }} className="card p-6 hover:shadow-lg transition-shadow">
    <Link to={`/farmers/${farmer._id}`}>
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {farmer.avatar ? <img src={`http://localhost:5000${farmer.avatar}`} alt={farmer.name} className="w-full h-full object-cover rounded-2xl" /> : farmer.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white truncate">{farmer.farmName || farmer.name}</h3>
          <p className="text-sm text-gray-500 truncate">{farmer.name}</p>
          {farmer.farmLocation && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><FiMapPin size={10} />{farmer.farmLocation}</p>
          )}
          <div className="flex items-center gap-1 mt-2">
            <FiStar size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{farmer.avgRating?.toFixed(1) || '0.0'}</span>
            <span className="text-xs text-gray-400">({farmer.totalReviews || 0} reviews)</span>
          </div>
        </div>
      </div>
      {farmer.farmDescription && (
        <p className="text-sm text-gray-500 mt-3 line-clamp-2">{farmer.farmDescription}</p>
      )}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <span className="text-primary-600 text-sm font-medium hover:underline">View Profile →</span>
      </div>
    </Link>
  </motion.div>
);

export default function Farmers() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => fetchFarmers(), 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/farmers', { params: { search, limit: 20 } });
      setFarmers(data.farmers);
      setTotal(data.total);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Our Farmers</h1>
          <p className="text-gray-500">{total} verified farmers on AgriLink</p>
        </div>
        <div className="relative mb-8 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-10" placeholder="Search farmers by name or location..." />
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : farmers.length === 0 ? (
          <EmptyState icon="👨‍🌾" title="No farmers found" description="Try a different search term" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmers.map(f => <FarmerCard key={f._id} farmer={f} />)}
          </div>
        )}
      </div>
    </div>
  );
}
