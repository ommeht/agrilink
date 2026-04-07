import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiPhone, FiMapPin, FiUpload, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { imgUrl } from '../utils/config';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar ? imgUrl(user.avatar) : null);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    farmName: user?.farmName || '',
    farmDescription: user?.farmDescription || '',
    farmLocation: user?.farmLocation || ''
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Location autocomplete
  const [locationQuery, setLocationQuery] = useState(user?.farmLocation || '');
  const [suggestions, setSuggestions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (locationRef.current && !locationRef.current.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLocationInput = (e) => {
    const val = e.target.value;
    setLocationQuery(val);
    setForm(f => ({ ...f, farmLocation: val }));
    clearTimeout(debounceRef.current);
    if (val.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLocationLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&addressdetails=1&limit=6`);
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch { setSuggestions([]); } finally { setLocationLoading(false); }
    }, 400);
  };

  const selectLocation = (place) => {
    const { city, town, village, county, state, country } = place.address;
    const label = [city || town || village || county, state, country].filter(Boolean).join(', ');
    setLocationQuery(label);
    setForm(f => ({ ...f, farmLocation: label }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) { setAvatar(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (avatar) formData.append('avatar', avatar);
      const { data } = await api.put('/auth/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Profile</h1>
        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary-600 flex items-center justify-center text-white text-3xl font-bold">
                {preview ? <img src={preview} alt="avatar" className="w-full h-full object-cover" /> : user?.name?.[0]}
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                <FiUpload size={12} className="text-white" />
                <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
              </label>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" value={form.name} onChange={set('name')} className="input pl-9" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="tel" value={form.phone} onChange={set('phone')} className="input pl-9" placeholder="+1 234 567 8900" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Address</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" value={form.address} onChange={set('address')} className="input pl-9" placeholder="Your address" />
              </div>
            </div>

            {user?.role === 'farmer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Farm Name</label>
                  <input type="text" value={form.farmName} onChange={set('farmName')} className="input" />
                </div>
                <div ref={locationRef} className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Farm Location</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={handleLocationInput}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      className="input pl-9 pr-9"
                      placeholder="Search city, state..."
                      autoComplete="off"
                    />
                    {locationLoading && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        <span className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin block" />
                      </span>
                    )}
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
                    >
                      {suggestions.map((place) => {
                        const { city, town, village, county, state, country } = place.address;
                        const line1 = city || town || village || county || place.display_name.split(',')[0];
                        const line2 = [state, country].filter(Boolean).join(', ');
                        return (
                          <li
                            key={place.place_id}
                            onMouseDown={() => selectLocation(place)}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-primary-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                          >
                            <FiMapPin size={14} className="text-primary-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{line1}</p>
                              <p className="text-xs text-gray-400">{line2}</p>
                            </div>
                          </li>
                        );
                      })}
                    </motion.ul>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Farm Description</label>
                  <textarea value={form.farmDescription} onChange={set('farmDescription')} className="input resize-none" rows={3} />
                </div>
              </>
            )}
          </div>

          <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiCheck /> Save Changes</>}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
