import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiShoppingCart, HiSearch, HiMenu, HiX, HiUser, HiLogout, HiClipboardList, HiShieldCheck } from 'react-icons/hi';
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
    const handler = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
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
      <nav className="glass-strong sticky top-0 z-50" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            <Link to="/admin" className="flex items-center gap-2 no-underline flex-shrink-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black text-white" style={{ background: 'linear-gradient(135deg, #6C63FF, #FF6584)' }}>I</div>
              <span className="text-xl font-bold gradient-text hidden sm:block">Dudez_Shop</span>
              <span className="badge bg-purple-500/20 text-purple-400 text-xs ml-2">Admin</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-gray-300 hover:text-white transition-colors text-sm font-medium no-underline flex items-center gap-1"><HiShieldCheck /> Dashboard</Link>
              <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileOpen(!profileOpen)} className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white cursor-pointer border-none" style={{ background: 'linear-gradient(135deg, #9333EA, #6C63FF)' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 glass-strong rounded-xl py-2 animate-fadeIn" style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-purple-400">Administrator</p>
                    </div>
                    <button onClick={() => { logout(); setProfileOpen(false); navigate('/login'); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition w-full border-none bg-transparent cursor-pointer"><HiLogout /> Logout</button>
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
    <nav className="glass-strong sticky top-0 z-50" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black text-white" style={{ background: 'linear-gradient(135deg, #6C63FF, #FF6584)' }}>I</div>
            <span className="text-xl font-bold gradient-text hidden sm:block">Dudez_Shop</span>
          </Link>

          {/* Search - always visible, responsive */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg">
            <div className="relative w-full">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="input-field pl-10 py-2 text-sm"
              />
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            <Link to="/products" className="text-gray-300 hover:text-white transition-colors text-sm font-medium no-underline">Products</Link>
            <Link to="/cart" className="relative text-gray-300 hover:text-white transition-colors no-underline">
              <HiShoppingCart className="text-2xl" />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
            </Link>
            {user ? (
              <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileOpen(!profileOpen)} className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white cursor-pointer border-none" style={{ background: 'linear-gradient(135deg, #6C63FF, #FF6584)' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 glass-strong rounded-xl py-2 animate-fadeIn" style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition no-underline"><HiUser /> Profile</Link>
                    <Link to="/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition no-underline"><HiClipboardList /> Orders</Link>
                    <button onClick={() => { logout(); setProfileOpen(false); navigate('/'); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition w-full border-none bg-transparent cursor-pointer"><HiLogout /> Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="btn-secondary text-sm no-underline">Login</Link>
                <Link to="/register" className="btn-primary text-sm no-underline">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile: cart + menu */}
          <div className="flex items-center gap-3 md:hidden flex-shrink-0">
            <Link to="/cart" className="relative text-gray-300 hover:text-white transition-colors no-underline">
              <HiShoppingCart className="text-xl" />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold" style={{ fontSize: '10px' }}>{cartCount}</span>}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-white text-2xl bg-transparent border-none cursor-pointer">
              {menuOpen ? <HiX /> : <HiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-fadeIn">
            <div className="flex flex-col gap-2">
              <Link to="/products" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white py-2 no-underline">Products</Link>
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white py-2 no-underline">Profile</Link>
                  <Link to="/orders" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white py-2 no-underline">Orders</Link>
                  <button onClick={() => { logout(); setMenuOpen(false); navigate('/'); }} className="text-red-400 hover:text-red-300 py-2 text-left bg-transparent border-none cursor-pointer text-base">Logout</button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary flex-1 text-center no-underline">Login</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 text-center no-underline">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
