import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiShoppingCart, HiSearch, HiMenu, HiX, HiUser, HiLogout, HiClipboardList, HiShieldCheck, HiSparkles } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (q) {
      navigate(`/products?search=${encodeURIComponent(q)}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  // Admin-only navbar
  if (isAdmin) {
    return (
      <nav className="glass-strong sticky top-0 z-50 border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            <Link to="/admin" className="flex items-center gap-3 no-underline flex-shrink-0">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl text-dark shadow-lg" style={{ background: 'linear-gradient(135deg, #E29578, #D4AF37)' }}>
                B
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white hidden sm:block">Buyzo</span>
              <span className="badge bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs">Admin Control</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-gray-300 hover:text-white transition-colors text-sm font-semibold no-underline flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <HiShieldCheck className="text-indigo-400 text-lg" /> Dashboard
              </Link>
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold text-dark cursor-pointer border-none shadow-md"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #E29578)' }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-56 glass-strong rounded-2xl p-2 animate-fadeIn border border-white/15 shadow-2xl z-50">
                    <div className="px-4 py-3 border-b border-white/10 mb-1">
                      <p className="text-sm font-bold text-white line-clamp-1">{user?.name}</p>
                      <p className="text-xs text-purple-400 font-semibold">Administrator</p>
                    </div>
                    <button
                      onClick={() => { logout(); setProfileOpen(false); navigate('/login'); }}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 rounded-xl transition w-full border-none bg-transparent cursor-pointer font-medium"
                    >
                      <HiLogout className="text-lg" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Regular user navbar
  return (
    <nav className="glass-strong sticky top-0 z-50 border-b border-white/10 shadow-xl backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 no-underline flex-shrink-0">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl text-dark shadow-lg shadow-primary/20" style={{ background: 'linear-gradient(135deg, #D4AF37, #E29578)' }}>
              B
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white hidden sm:block">Buyzo</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg">
            <div className="relative w-full">
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-full bg-white/5 border border-white/15 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-2 pl-10 pr-4 text-white text-sm placeholder-gray-400 transition-all outline-none"
              />
            </div>
          </form>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-5 flex-shrink-0">
            <Link to="/products" className="text-gray-300 hover:text-white transition-colors text-sm font-semibold no-underline">
              Products
            </Link>
            
            <Link to="/cart" className="relative text-gray-300 hover:text-white transition-colors no-underline p-2 rounded-xl hover:bg-white/5">
              <HiShoppingCart className="text-2xl text-indigo-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-secondary to-primary text-dark text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold text-dark cursor-pointer border-none shadow-md"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #E29578)' }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-56 glass-strong rounded-2xl p-2 animate-fadeIn border border-white/15 shadow-2xl z-50">
                    <div className="px-4 py-3 border-b border-white/10 mb-1">
                      <p className="text-sm font-bold text-white line-clamp-1">{user.name}</p>
                      <p className="text-xs text-gray-400 line-clamp-1">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition no-underline font-medium">
                      <HiUser className="text-indigo-400 text-lg" /> Profile
                    </Link>
                    <Link to="/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition no-underline font-medium">
                      <HiClipboardList className="text-purple-400 text-lg" /> My Orders
                    </Link>
                    <button
                      onClick={() => { logout(); setProfileOpen(false); navigate('/'); }}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 rounded-xl transition w-full border-none bg-transparent cursor-pointer font-medium mt-1"
                    >
                      <HiLogout className="text-lg" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2.5">
                <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 no-underline transition">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-xl text-sm font-semibold text-dark no-underline transition shadow-lg shadow-primary/20" style={{ background: 'linear-gradient(135deg, #D4AF37, #E29578)' }}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Cart & Hamburger */}
          <div className="flex items-center gap-3 md:hidden flex-shrink-0">
            <Link to="/cart" className="relative text-gray-300 hover:text-white transition-colors no-underline">
              <HiShoppingCart className="text-2xl text-indigo-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold" style={{ fontSize: '10px' }}>
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-white text-2xl bg-transparent border-none cursor-pointer p-1">
              {menuOpen ? <HiX /> : <HiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-fadeIn">
            <div className="flex flex-col gap-2">
              <Link to="/products" onClick={() => setMenuOpen(false)} className="text-gray-200 hover:text-white py-2 px-3 rounded-xl hover:bg-white/5 no-underline font-medium">
                Products Catalog
              </Link>
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="text-gray-200 hover:text-white py-2 px-3 rounded-xl hover:bg-white/5 no-underline font-medium">
                    Profile
                  </Link>
                  <Link to="/orders" onClick={() => setMenuOpen(false)} className="text-gray-200 hover:text-white py-2 px-3 rounded-xl hover:bg-white/5 no-underline font-medium">
                    My Orders
                  </Link>
                  <button onClick={() => { logout(); setMenuOpen(false); navigate('/'); }} className="text-red-400 hover:text-red-300 py-2 px-3 text-left bg-transparent border-none cursor-pointer text-sm font-medium">
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 py-2.5 text-center text-sm font-semibold rounded-xl bg-white/5 text-white no-underline border border-white/10">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 py-2.5 text-center text-sm font-semibold rounded-xl bg-indigo-600 text-white no-underline shadow-md">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
