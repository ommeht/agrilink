import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiArrowLeft, FiUpload } from 'react-icons/fi';
import { EmptyState, Skeleton, StarRating } from '../../components/ui';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { formatINR } from '../../utils/currency';

const CATEGORIES = ['vegetables', 'fruits', 'grains', 'dairy', 'poultry', 'herbs', 'other'];

export function FarmerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/my').then(res => setProducts(res.data.products)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Products</h1>
          <Link to="/farmer/products/new">
            <motion.button whileTap={{ scale: 0.95 }} className="btn-primary flex items-center gap-2">
              <FiPlus /> Add Product
            </motion.button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64" />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState icon="🌱" title="No products yet" description="Add your first product to start selling"
            action={<Link to="/farmer/products/new" className="btn-primary">Add Product</Link>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {products.map(product => {
                const imageUrl = product.images?.[0] ? `http://localhost:5000${product.images[0]}` : `https://placehold.co/400x200/22c55e/white?text=${encodeURIComponent(product.name)}`;
                return (
                  <motion.div key={product._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="card overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-40 overflow-hidden">
                      <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      <div className={`absolute top-2 right-2 badge ${product.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.isAvailable ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{product.name}</h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-primary-600 font-bold">{formatINR(product.price)}/{product.unit}</span>
                        <span className="text-sm text-gray-500">Stock: {product.quantity}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        <StarRating rating={product.averageRating} size="sm" />
                        <span className="text-xs text-gray-500">({product.numReviews})</span>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/farmer/products/edit/${product._id}`} className="flex-1">
                          <button className="w-full flex items-center justify-center gap-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <FiEdit2 size={14} /> Edit
                          </button>
                        </Link>
                        <button onClick={() => handleDelete(product._id)}
                          className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [form, setForm] = useState({
    name: '', description: '', price: '', quantity: '', unit: 'kg',
    category: 'vegetables', harvestDate: '', isOrganic: false, isAvailable: true
  });

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`).then(res => {
        const p = res.data.product;
        setForm({
          name: p.name, description: p.description, price: p.price,
          quantity: p.quantity, unit: p.unit, category: p.category,
          harvestDate: p.harvestDate ? p.harvestDate.split('T')[0] : '',
          isOrganic: p.isOrganic, isAvailable: p.isAvailable
        });
        if (p.images?.length) setPreviews(p.images.map(img => `http://localhost:5000${img}`));
      });
    }
  }, [id, isEdit]);

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach(img => formData.append('images', img));

      if (isEdit) {
        await api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated!');
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product added!');
      }
      navigate('/farmer/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/farmer/products" className="flex items-center gap-2 text-primary-600 hover:underline mb-6">
          <FiArrowLeft size={16} /> Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Product Name *</label>
              <input type="text" value={form.name} onChange={set('name')} className="input" placeholder="e.g. Fresh Tomatoes" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description *</label>
              <textarea value={form.description} onChange={set('description')} className="input resize-none" rows={4} placeholder="Describe your product..." required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                <input type="number" value={form.price} onChange={set('price')} className="input pl-7" placeholder="0.00" min="0" step="0.01" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Quantity *</label>
              <input type="number" value={form.quantity} onChange={set('quantity')} className="input" placeholder="0" min="0" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Unit</label>
              <select value={form.unit} onChange={set('unit')} className="input">
                {['kg', 'g', 'lb', 'piece', 'dozen', 'liter', 'bunch'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
              <select value={form.category} onChange={set('category')} className="input">
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Harvest Date</label>
              <input type="date" value={form.harvestDate} onChange={set('harvestDate')} className="input" />
            </div>
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isOrganic} onChange={set('isOrganic')} className="w-4 h-4 text-primary-600 rounded" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">🌿 Organic</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isAvailable} onChange={set('isAvailable')} className="w-4 h-4 text-primary-600 rounded" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Available</span>
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Product Images</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors">
              <FiUpload size={24} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Click to upload images (max 5)</span>
              <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
            </label>
            {previews.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-20 h-20 rounded-xl object-cover border-2 border-primary-200" />
                ))}
              </div>
            )}
          </div>

          <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{isEdit ? 'Updating...' : 'Adding...'}</span> : isEdit ? 'Update Product' : 'Add Product'}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
