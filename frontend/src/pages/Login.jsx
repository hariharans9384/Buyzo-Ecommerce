import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiSparkles, HiShieldCheck, HiTruck } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user?.role === 'admin') {
        toast.success('Welcome back, Admin!');
        navigate('/admin');
      } else {
        toast.success('Welcome back to Buyzo!');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    toast.success(`Demo credentials set (${demoEmail})`);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden glass-strong border border-white/10 shadow-2xl">
        
        {/* Left Side: Brand & Benefits Banner */}
        <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-black/80">
          {/* Decorative glow elements */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Logo Badge */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #6366F1, #EC4899)' }}>
                B
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">Buyzo</span>
            </div>

            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              Elevate Your Shopping Experience
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-8">
              Access your personalized dashboard, track orders in real-time, and unlock member-exclusive deals.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-4 my-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <HiShieldCheck className="text-indigo-400 text-xl flex-shrink-0" />
              <span className="text-xs text-gray-200 font-medium">100% Encrypted & Safe Checkout</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <HiTruck className="text-purple-400 text-xl flex-shrink-0" />
              <span className="text-xs text-gray-200 font-medium">Express Dispatch & Real-time Tracking</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <HiSparkles className="text-pink-400 text-xl flex-shrink-0" />
              <span className="text-xs text-gray-200 font-medium">Curated Premium Audio & Electronics</span>
            </div>
          </div>

          {/* Quick Demo Credentials Assistant */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Quick Demo Login</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin@gmail.com', 'Admin123')}
                className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-xs text-indigo-200 font-medium transition cursor-pointer"
              >
                🔑 Admin Demo
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center bg-black/40 backdrop-blur-xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Sign In</h1>
            <p className="text-gray-400 text-sm mt-1">Please enter your details to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <HiMail className="text-lg" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder-gray-500 transition-all outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition no-underline font-medium">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <HiLockClosed className="text-lg" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-3 pl-11 pr-12 text-white text-sm placeholder-gray-500 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition cursor-pointer bg-transparent border-none"
                >
                  {showPassword ? <HiEyeOff className="text-lg" /> : <HiEye className="text-lg" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Account'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <p className="text-sm text-gray-400">
              New to Buyzo?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold no-underline transition">
                Create an Account
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
