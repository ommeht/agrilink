import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiTruck, FiStar } from 'react-icons/fi';
import { GiWheat, GiFruitBowl, GiCarrot } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function Home() {
  const { user } = useAuth();
  const farmerLink = user?.role === 'farmer' ? '/farmer/dashboard' : '/register?role=farmer';
  const features = [
    { icon: <GiWheat className="text-4xl text-primary-600" />, title: 'Fresh From Farm', desc: 'Direct from farmers to your table, no middlemen.' },
    { icon: <FiShield className="text-4xl text-primary-600" />, title: 'Verified Farmers', desc: 'All farmers are verified for quality assurance.' },
    { icon: <FiTruck className="text-4xl text-primary-600" />, title: 'Fast Delivery', desc: 'Get fresh produce delivered to your doorstep.' },
    { icon: <FiStar className="text-4xl text-primary-600" />, title: 'Rated & Reviewed', desc: 'Real reviews from real customers.' }
  ];

  const categories = [
    { name: 'Vegetables', icon: <GiCarrot />, color: 'bg-orange-100 text-orange-600', link: '/products?category=vegetables' },
    { name: 'Fruits', icon: <GiFruitBowl />, color: 'bg-red-100 text-red-600', link: '/products?category=fruits' },
    { name: 'Grains', icon: <GiWheat />, color: 'bg-yellow-100 text-yellow-600', link: '/products?category=grains' },
    { name: 'Dairy', icon: '🥛', color: 'bg-blue-100 text-blue-600', link: '/products?category=dairy' },
    { name: 'Herbs', icon: '🌿', color: 'bg-green-100 text-green-600', link: '/products?category=herbs' },
    { name: 'Poultry', icon: '🥚', color: 'bg-amber-100 text-amber-600', link: '/products?category=poultry' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-primary-50 via-white to-earth-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
              className="absolute text-primary-200 dark:text-primary-900 text-6xl"
              style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 20}%` }}>
              {['🌾', '🥕', '🍅', '🌽', '🥦', '🍎'][i]}
            </motion.div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                🌱 Farm to Table Platform
              </motion.span>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                Fresh Produce,{' '}
                <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                  Direct from Farmers
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Connect directly with local farmers. Get the freshest organic produce delivered to your door while supporting sustainable agriculture.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                    Shop Now <FiArrowRight />
                  </motion.button>
                </Link>
                <Link to={farmerLink}>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="btn-outline flex items-center gap-2 text-lg px-8 py-4">
                    Sell Your Produce
                  </motion.button>
                </Link>
              </div>
              <div className="flex items-center gap-8 mt-10">
                {[['500+', 'Farmers'], ['10K+', 'Customers'], ['50K+', 'Orders']].map(([num, label]) => (
                  <div key={label}>
                    <p className="text-2xl font-bold text-primary-600">{num}</p>
                    <p className="text-sm text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block">
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl flex items-center justify-center text-9xl shadow-2xl shadow-primary-500/30">
                  🌾
                </div>
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -bottom-6 -left-6 card p-4 shadow-xl">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">🥕 Fresh Carrots</p>
                <p className="text-primary-600 font-bold">₹249/kg</p>
                </motion.div>
                <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="absolute -top-6 -right-6 card p-4 shadow-xl">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">⭐ 4.9 Rating</p>
                  <p className="text-xs text-gray-500">2,400+ reviews</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Shop by Category</h2>
            <p className="text-gray-500">Find exactly what you're looking for</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div key={cat.name} {...fadeUp} transition={{ delay: i * 0.1 }}>
                <Link to={cat.link}>
                  <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}
                    className={`${cat.color} rounded-2xl p-6 text-center cursor-pointer transition-shadow hover:shadow-lg`}>
                    <div className="text-4xl mb-2">{cat.icon}</div>
                    <p className="font-semibold text-sm">{cat.name}</p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose AgriLink?</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div key={f.title} {...fadeUp} transition={{ delay: i * 0.15 }}
                whileHover={{ y: -6 }} className="card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <motion.div {...fadeUp} className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Are You a Farmer?</h2>
          <p className="text-primary-100 text-xl mb-8">Join thousands of farmers selling directly to customers. No middlemen, better prices.</p>
          <Link to={farmerLink}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="bg-white text-primary-600 font-bold px-10 py-4 rounded-xl text-lg hover:shadow-xl transition-shadow">
              Start Selling Today 🌾
            </motion.button>
          </Link>
        </motion.div>
      </section>


    </div>
  );
}
