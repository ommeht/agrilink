import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';

const links = {
  Marketplace: [
    { label: 'Browse Products', to: '/products' },
    { label: 'Our Farmers', to: '/farmers' },
    { label: 'Categories', to: '/products' },
  ],
  Farmers: [
    { label: 'Sell on AgriLink', to: '/register?role=farmer' },
    { label: 'Farmer Dashboard', to: '/farmer/dashboard' },
    { label: 'Manage Products', to: '/farmer/products' },
  ],
  Account: [
    { label: 'Login', to: '/login' },
    { label: 'Register', to: '/register' },
    { label: 'My Orders', to: '/orders' },
    { label: 'Profile', to: '/profile' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      {/* Top Banner */}
      <div className="bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-lg">🌱 Fresh produce, straight from the farm</p>
            <p className="text-primary-100 text-sm">Join 500+ farmers and 10,000+ happy customers</p>
          </div>
          <Link to="/register">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="bg-white text-primary-600 font-bold px-6 py-2.5 rounded-xl text-sm hover:shadow-lg transition-shadow whitespace-nowrap">
              Get Started Free
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-primary-500 text-3xl"><GiWheat /></span>
              <span className="text-white font-extrabold text-2xl">AgriLink</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Connecting farmers directly with customers. No middlemen, fresher produce, better prices — supporting sustainable agriculture across India.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><FiMail size={14} className="text-primary-500" /> <span>support@agrilink.com</span></div>
              <div className="flex items-center gap-2"><FiPhone size={14} className="text-primary-500" /> <span>+91 98765 43210</span></div>
              <div className="flex items-center gap-2"><FiMapPin size={14} className="text-primary-500" /> <span>Mumbai, Maharashtra, India</span></div>
            </div>
          </div>

          {/* Nav Link Groups */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <p className="text-white font-semibold mb-4">{group}</p>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.to}>
                    <Link to={item.to}
                      className="text-sm hover:text-primary-400 transition-colors hover:translate-x-1 inline-block">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} AgriLink. All rights reserved.</p>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            {[['500+', 'Farmers'], ['10K+', 'Customers'], ['50K+', 'Orders']].map(([num, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-primary-500 font-bold">{num}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            {[
              { icon: <FiGithub size={16} />, href: 'https://github.com' },
              { icon: <FiTwitter size={16} />, href: 'https://twitter.com' },
              { icon: <FiInstagram size={16} />, href: 'https://instagram.com' },
            ].map(({ icon, href }, i) => (
              <motion.a key={i} href={href} target="_blank" rel="noreferrer"
                whileHover={{ scale: 1.2, color: '#16a34a' }}
                className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                {icon}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
