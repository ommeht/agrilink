import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon, FiShoppingCart, FiBell, FiMenu, FiX, FiUser, FiLogOut, FiPackage } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import { imgUrl } from '../utils/config';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      api.get('/farmers/notifications/me').then(res => {
        setUnread(res.data.notifications.filter(n => !n.read).length);
      }).catch(() => {});
    }
  }, [user, location]);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = user?.role === 'farmer'
    ? [{ to: '/farmer/dashboard', label: 'Dashboard' }, { to: '/farmer/products', label: 'Products' }, { to: '/farmer/orders', label: 'Orders' }, { to: '/farmer/ai', label: 'AI Assistant' }]
    : user?.role === 'admin'
    ? [{ to: '/admin', label: 'Admin Panel' }]
    : [{ to: '/products', label: 'Products' }, { to: '/farmers', label: 'Farmers' }, { to: '/orders', label: 'My Orders' }];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-white dark:bg-gray-900'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div whileHover={{ rotate: 20 }} className="text-primary-600 text-2xl">
              <GiWheat />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              AgriLink
            </span>
          </Link>

         
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`font-medium transition-colors hover:text-primary-600 ${location.pathname === link.to ? 'text-primary-600' : 'text-gray-600 dark:text-gray-300'}`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={toggle}
              className="p-2 rounded-xl text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors">
              {dark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </motion.button>

            {user?.role === 'customer' && (
              <Link to="/cart">
                <motion.div whileTap={{ scale: 0.9 }} className="relative p-2 rounded-xl text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors">
                  <FiShoppingCart size={20} />
                  {itemCount > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {itemCount}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            )}

            {user && (
              <Link to="/notifications">
                <motion.div whileTap={{ scale: 0.9 }} className="relative p-2 rounded-xl text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors">
                  <FiBell size={20} />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {unread}
                    </span>
                  )}
                </motion.div>
              </Link>
            )}

            {user ? (
              <div className="relative">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {user.avatar ? (
                    <img src={imgUrl(user.avatar)} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">{user.name.split(' ')[0]}</span>
                </motion.button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 card shadow-xl py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                      <Link to="/profile" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors">
                        <FiUser size={14} /> Profile
                      </Link>
                      {user.role === 'customer' && (
                        <Link to="/orders" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors">
                          <FiPackage size={14} /> My Orders
                        </Link>
                      )}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-800 transition-colors">
                        <FiLogOut size={14} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-outline py-2 px-4 text-sm">Login</Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm">Sign Up</Link>
              </div>
            )}

            <button className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-4 space-y-2">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                className="block py-2 px-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-800 font-medium">
                {link.label}
              </Link>
            ))}
            {!user && (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2 px-3 rounded-lg text-primary-600 font-medium">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block btn-primary text-center">Sign Up</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
