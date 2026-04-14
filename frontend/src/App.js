import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Farmers from './pages/Farmers';
import FarmerProfile from './pages/FarmerProfile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import { OrderHistory, OrderDetail } from './pages/Orders';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

// Farmer Pages
import FarmerDashboard from './pages/farmer/Dashboard';
import { FarmerProducts, ProductForm } from './pages/farmer/Products';
import FarmerOrders from './pages/farmer/Orders';
import AIChatbot from './pages/farmer/AIChatbot';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';

function AppRoutes() {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/farmers" element={<Farmers />} />
          <Route path="/farmers/:id" element={<FarmerProfile />} />

          {/* Customer Protected */}
          <Route path="/cart" element={<ProtectedRoute roles={['customer']}><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute roles={['customer']}><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute roles={['customer']}><OrderHistory /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

          {/* Shared Protected */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

          {/* Farmer Protected */}
          <Route path="/farmer/dashboard" element={<ProtectedRoute roles={['farmer']}><FarmerDashboard /></ProtectedRoute>} />
          <Route path="/farmer/products" element={<ProtectedRoute roles={['farmer']}><FarmerProducts /></ProtectedRoute>} />
          <Route path="/farmer/products/new" element={<ProtectedRoute roles={['farmer']}><ProductForm /></ProtectedRoute>} />
          <Route path="/farmer/products/edit/:id" element={<ProtectedRoute roles={['farmer']}><ProductForm /></ProtectedRoute>} />
          <Route path="/farmer/orders" element={<ProtectedRoute roles={['farmer']}><FarmerOrders /></ProtectedRoute>} />
          <Route path="/farmer/ai" element={<ProtectedRoute roles={['farmer']}><AIChatbot /></ProtectedRoute>} />

          {/* Admin Protected */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen pt-20 flex flex-col items-center justify-center text-center px-4">
              <div className="text-8xl mb-4">🌾</div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
              <p className="text-gray-500 mb-6">Page not found</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          } />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
                success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
              }}
            />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
