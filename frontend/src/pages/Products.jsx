import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { ProductCard, ProductCardSkeleton, EmptyState } from '../components/ui';
import api from '../utils/api';
import { formatINR } from '../utils/currency';

const CATEGORIES = ['all', 'vegetables', 'fruits', 'grains', 'dairy', 'poultry', 'herbs', 'other'];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    page: Number(searchParams.get('page')) || 1
  });

  useEffect(() => {
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== 0));
      const { data } = await api.get('/products', { params });
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch {} finally { setLoading(false); }
  };

  const setFilter = (key, value) => {
    const updated = { ...filters, [key]: value, page: 1 };
    setFilters(updated);
    const params = Object.fromEntries(Object.entries(updated).filter(([, v]) => v !== '' && v !== 1));
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', minPrice: '', maxPrice: '', rating: '', page: 1 });
    setSearchParams({});
  };

  const hasFilters = filters.search || filters.category || filters.minPrice || filters.maxPrice || filters.rating;

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Fresh Products</h1>
          <p className="text-gray-500">{total} products available from local farmers</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" value={filters.search} onChange={e => setFilter('search', e.target.value)}
              className="input pl-10" placeholder="Search products..." />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-medium transition-colors ${showFilters ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
            <FiFilter size={18} /> Filters {hasFilters && <span className="w-2 h-2 bg-primary-600 rounded-full" />}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 px-3">
              <FiX size={16} /> Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <motion.button key={cat} whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('category', cat === 'all' ? '' : cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${(cat === 'all' && !filters.category) || filters.category === cat ? 'bg-primary-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-400'}`}>
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="card p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Price (₹)</label>
              <input type="number" value={filters.minPrice} onChange={e => setFilter('minPrice', e.target.value)}
                className="input" placeholder="0" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Price (₹)</label>
              <input type="number" value={filters.maxPrice} onChange={e => setFilter('maxPrice', e.target.value)}
                className="input" placeholder="1000" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Rating</label>
              <select value={filters.rating} onChange={e => setFilter('rating', e.target.value)} className="input">
                <option value="">Any Rating</option>
                {[4, 3, 2, 1].map(r => <option key={r} value={r}>{r}+ Stars</option>)}
              </select>
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState icon="🌾" title="No products found" description="Try adjusting your filters or search terms" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {[...Array(pages)].map((_, i) => (
              <motion.button key={i} whileTap={{ scale: 0.9 }}
                onClick={() => setFilters({ ...filters, page: i + 1 })}
                className={`w-10 h-10 rounded-xl font-medium transition-all ${filters.page === i + 1 ? 'bg-primary-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-400'}`}>
                {i + 1}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
