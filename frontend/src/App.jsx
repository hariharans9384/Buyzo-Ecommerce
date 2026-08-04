import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ReturnPolicy from './pages/ReturnPolicy';
import ContactUs from './pages/ContactUs';

// Blocks admin from accessing customer pages — redirects to /admin
function CustomerOnly({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (isAdmin) return <Navigate to="/admin" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<CustomerOnly><Home /></CustomerOnly>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/products" element={<CustomerOnly><Products /></CustomerOnly>} />
                <Route path="/products/:id" element={<CustomerOnly><ProductDetail /></CustomerOnly>} />
                <Route path="/cart" element={<CustomerOnly><Cart /></CustomerOnly>} />
                <Route path="/checkout" element={<ProtectedRoute><CustomerOnly><Checkout /></CustomerOnly></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><CustomerOnly><Profile /></CustomerOnly></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><CustomerOnly><Orders /></CustomerOnly></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/terms" element={<TermsConditions />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/contact" element={<ContactUs />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" toastOptions={{
            className: '!bg-[rgba(26,26,46,0.95)] !text-white !border !border-white/10 !backdrop-blur-xl',
            duration: 3000,
            style: { background: 'rgba(26,26,46,0.95)', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }
          }} />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
