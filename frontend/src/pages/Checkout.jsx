import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiCreditCard, FiCheck, FiHome, FiHash } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';

export default function Checkout() {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const debounceRef = useRef(null);

  const [form, setForm] = useState({
    street: '', city: '', state: '', zipCode: '',
    paymentMethod: 'cash_on_delivery', notes: ''
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  // Auto-fill city & state from Indian pincode using OpenStreetMap Nominatim
  const handlePincode = (e) => {
    const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
    setForm(f => ({ ...f, zipCode: pin, city: '', state: '' }));
    setPinError('');
    setPinSuccess(false);
    clearTimeout(debounceRef.current);
    if (pin.length !== 6) return;

    debounceRef.current = setTimeout(async () => {
      setPinLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${pin}&country=India&format=json&addressdetails=1&limit=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();

        if (data.length > 0) {
          const addr = data[0].address;
          // Pick best city label available
          const city =
            addr.state_district ||
            addr.city ||
            addr.town ||
            addr.county ||
            addr.village ||
            addr.suburb ||
            '';
          const state = addr.state || '';

          if (city && state) {
            setForm(f => ({ ...f, city, state }));
            setPinSuccess(true);
            toast.success(`\ud83d\udccd ${city}, ${state}`);
          } else {
            setPinError('Location details incomplete. Please fill manually.');
          }
        } else {
          setPinError('PIN code not found. Please enter city and state manually.');
        }
      } catch {
        setPinError('Could not fetch location. Please enter manually.');
      } finally { setPinLoading(false); }
    }, 600);
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!cart.items?.length) return toast.error('Cart is empty');
    setLoading(true);
    try {
      const items = cart.items.map(i => ({ product: i.product?._id || i.product, quantity: i.quantity }));
      const { data } = await api.post('/orders', {
        items,
        shippingAddress: { street: form.street, city: form.city, state: form.state, zipCode: form.zipCode },
        paymentMethod: form.paymentMethod,
        notes: form.notes
      });
      await fetchCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

        <form onSubmit={handleOrder}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

              {/* Shipping Address */}
              <div className="card p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <FiMapPin className="text-primary-600" /> Shipping Address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Street Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Street Address / House No. *
                    </label>
                    <div className="relative">
                      <FiHome className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={form.street}
                        onChange={set('street')}
                        className="input pl-9"
                        placeholder="House No., Street, Area, Landmark"
                        required
                      />
                    </div>
                  </div>

                  {/* Pincode — triggers auto-fill */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      PIN Code *
                    </label>
                    <div className="relative">
                      <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={form.zipCode}
                        onChange={handlePincode}
                        className={`input pl-9 pr-10 tracking-widest font-mono ${pinError ? 'border-red-400 focus:ring-red-400' : pinSuccess ? 'border-green-400 focus:ring-green-400' : ''}`}
                        placeholder="Enter 6-digit PIN code"
                        maxLength={6}
                        required
                      />
                      {/* Status indicator */}
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {pinLoading && <span className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin block" />}
                        {pinSuccess && !pinLoading && <span className="text-green-500 text-lg">✓</span>}
                        {pinError && !pinLoading && <span className="text-red-500 text-lg">✗</span>}
                      </span>
                    </div>
                    {pinError && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        ⚠ {pinError}
                      </motion.p>
                    )}
                    {pinSuccess && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                        ✓ Location auto-filled from PIN code
                      </motion.p>
                    )}
                  </div>

                  {/* City — auto-filled */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      City / District *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.city}
                        onChange={set('city')}
                        className={`input ${pinSuccess && form.city ? 'bg-green-50 dark:bg-green-900/10 border-green-300' : ''}`}
                        placeholder="Auto-filled from PIN code"
                        required
                      />
                      {pinLoading && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin block" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* State — auto-filled */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      State *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.state}
                        onChange={set('state')}
                        className={`input ${pinSuccess && form.state ? 'bg-green-50 dark:bg-green-900/10 border-green-300' : ''}`}
                        placeholder="Auto-filled from PIN code"
                        required
                      />
                      {pinLoading && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin block" />
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Payment Method */}
              <div className="card p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiCreditCard className="text-primary-600" /> Payment Method
                </h2>
                <div className="space-y-3">
                  {[
                    { value: 'cash_on_delivery', label: '💵 Cash on Delivery', desc: 'Pay when your order arrives' },
                    { value: 'bank_transfer', label: '🏦 Bank Transfer', desc: 'Transfer to farmer\'s bank account' }
                  ].map(pm => (
                    <label key={pm.value}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.paymentMethod === pm.value ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}>
                      <input type="radio" name="payment" value={pm.value}
                        checked={form.paymentMethod === pm.value} onChange={set('paymentMethod')}
                        className="mt-0.5 accent-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{pm.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{pm.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Order Notes */}
              <div className="card p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order Notes <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea value={form.notes} onChange={set('notes')}
                  className="input resize-none" rows={3}
                  placeholder="Any special delivery instructions..." />
              </div>
            </div>

            {/* Order Summary */}
            <div className="card p-6 h-fit sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                {cart.items?.map(item => (
                  <div key={item._id} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span className="truncate mr-2">{item.product?.name} × {item.quantity}</span>
                    <span className="shrink-0">{formatINR(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 mb-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatINR(cart.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-gray-900 dark:text-white text-lg pt-3 border-t border-gray-100 dark:border-gray-800 mb-6">
                <span>Total</span>
                <span className="text-primary-600">{formatINR(cart.totalAmount)}</span>
              </div>

              {/* Delivery address preview */}
              {form.city && form.state && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs text-gray-500 border border-gray-200 dark:border-gray-700">
                  <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                    <FiMapPin size={11} /> Delivering to
                  </p>
                  <p>{form.street && `${form.street}, `}{form.city}, {form.state} - {form.zipCode}</p>
                </motion.div>
              )}

              <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                {loading
                  ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><FiCheck /> Place Order</>}
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
