import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiUser, HiMail, HiLockClosed, HiEye, HiEyeOff, HiPhone, HiBadgeCheck, HiGift, HiLightningBolt } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, phone);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden glass-strong border border-white/10 shadow-2xl">


        <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-purple-900/60 via-indigo-900/40 to-black/80">
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}>
                B
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">Buyzo</span>
            </div>

            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              Join Our VIP Shopping Network
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-8">
              Create your free account today and start enjoying member perks, express checkouts, and priority support.
            </p>
          </div>

          <div className="space-y-4 my-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <HiGift className="text-pink-400 text-xl flex-shrink-0" />
              <span className="text-xs text-gray-200 font-medium">Welcome Coupon on First Order</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <HiLightningBolt className="text-amber-400 text-xl flex-shrink-0" />
              <span className="text-xs text-gray-200 font-medium">Fast 1-Click Order Tracking & Invoices</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <HiBadgeCheck className="text-emerald-400 text-xl flex-shrink-0" />
              <span className="text-xs text-gray-200 font-medium">Verified Product Warranty Protection</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-gray-400">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>


        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center bg-black/40 backdrop-blur-xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
            <p className="text-gray-400 text-sm mt-1">Fill in the form below to register your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <HiUser className="text-lg" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder-gray-500 transition-all outline-none"
                  placeholder="Prince Princess"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
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
                    className="w-full bg-white/5 border border-white/15 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder-gray-500 transition-all outline-none"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <HiPhone className="text-lg" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder-gray-500 transition-all outline-none"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <HiLockClosed className="text-lg" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl py-3 pl-11 pr-10 text-white text-sm placeholder-gray-500 transition-all outline-none"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer bg-transparent border-none"
                  >
                    {showPassword ? <HiEyeOff className="text-lg" /> : <HiEye className="text-lg" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <HiLockClosed className="text-lg" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder-gray-500 transition-all outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 mt-2 rounded-xl text-white font-semibold text-sm shadow-lg shadow-purple-500/25 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 border-none cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}
            >
              {loading ? 'Registering Account...' : 'Complete Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-white/10 pt-4">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold no-underline transition">
                Sign In
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}


export default Register;