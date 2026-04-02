import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiMapPin } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';
import { FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get('role') || 'customer');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', farmName: '', farmLocation: '', farmDescription: '' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Location autocomplete state
  const [locationQuery, setLocationQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationRef = useRef(null);
  const debounceRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (locationRef.current && !locationRef.current.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLocationInput = (e) => {
    const val = e.target.value;
    setLocationQuery(val);
    setForm({ ...form, farmLocation: val });
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
    setForm({ ...form, farmLocation: label });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register({ ...form, role });
      toast.success(`Welcome to AgriLink, ${user.name.split(' ')[0]}!`);
      if (user.role === 'farmer') navigate('/farmer/dashboard');
      else navigate('/products');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white dark:from-gray-950 dark:to-gray-900 px-4 pt-16 pb-8">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="card p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
            <p className="text-gray-500 mt-1">Join the AgriLink community</p>
          </div>

          {/* Role Toggle */}
          <div className="flex gap-3 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {[{ value: 'customer', label: 'Customer', icon: <FiShoppingBag /> },
              { value: 'farmer', label: 'Farmer', icon: <GiWheat /> }].map(r => (
              <motion.button key={r.value} type="button" onClick={() => setRole(r.value)} whileTap={{ scale: 0.97 }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${role === r.value ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm' : 'text-gray-500'}`}>
                {r.icon} {r.label}
              </motion.button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" value={form.name} onChange={set('name')} className="input pl-10" placeholder="John Doe" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" value={form.email} onChange={set('email')} className="input pl-10" placeholder="you@example.com" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
                    className="input pl-10 pr-10" placeholder="Min. 6 characters" required minLength={6} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {role === 'farmer' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Farm Name</label>
                    <input type="text" value={form.farmName} onChange={set('farmName')} className="input" placeholder="Green Valley Farm" required />
                  </div>
                  <div ref={locationRef} className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Farm Location</label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={locationQuery}
                        onChange={handleLocationInput}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        className="input pl-10 pr-10"
                        placeholder="Search city, state..."
                        autoComplete="off"
                      />
                      {locationLoading && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin block" />
                        </span>
                      )}
                    </div>

                    {/* Suggestions Dropdown */}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Farm Description</label>
                    <textarea value={form.farmDescription} onChange={set('farmDescription')} className="input resize-none" rows={3} placeholder="Tell customers about your farm..." />
                  </div>
                </motion.div>
              )}
            </div>

            <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account...</span> : 'Create Account'}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
