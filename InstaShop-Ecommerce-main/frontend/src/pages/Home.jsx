import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiShoppingBag, HiTruck, HiShieldCheck, HiRefresh } from 'react-icons/hi';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/products?limit=8&sort=rating'),
      API.get('/products/categories')
    ]).then(([prodRes, catRes]) => {
      setFeatured(prodRes.data.products);
      setCategories(catRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const features = [
    { icon: HiTruck, title: 'Free Shipping', desc: 'On All Orders ' },
    { icon: HiShieldCheck, title: 'Secure Payment', desc: 'Razorpay integration' },
    { icon: HiRefresh, title: '7-Day Returns', desc: 'Hassle-free returns' },
    { icon: HiShoppingBag, title: 'Premium Quality', desc: 'Curated products' },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 animate-float" style={{ background: 'radial-gradient(circle, #6C63FF, transparent)' }} />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #FF6584, transparent)', animation: 'float 8s ease-in-out infinite reverse' }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block badge bg-primary/20 text-primary mb-6 px-4 py-1.5 text-sm">✨ New Collection 2026</span>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 leading-tight">
              Discover Your <span className="gradient-text">Perfect Style</span>
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">Explore our curated collection of premium products. From electronics to fashion, find everything you need with unbeatable prices.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-primary px-8 py-3.5 text-base flex items-center justify-center gap-2 no-underline">Shop Now <HiArrowRight /></Link>
              <Link to="/products?category=Electronics" className="btn-secondary px-8 py-3.5 text-base no-underline text-center">Explore Electronics</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div key={i} className="glass rounded-xl p-5 text-center group hover:border-primary/30 transition-all duration-300">
              <f.icon className="text-3xl text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-gray-400 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map(cat => (
              <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`} className="glass rounded-xl p-6 text-center group hover:border-primary/30 transition-all duration-300 no-underline">
                <h3 className="text-white font-semibold text-sm group-hover:text-primary transition-colors">{cat}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Featured Products</h2>
          <Link to="/products" className="text-primary hover:text-primary-light flex items-center gap-1 text-sm font-medium no-underline">View All <HiArrowRight /></Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-white/5" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-white/5 rounded w-1/3" />
                  <div className="h-4 bg-white/5 rounded w-2/3" />
                  <div className="h-5 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map(product => <ProductCard key={product._id} product={product} />)}
          </div>
        )}
      </section>

      {/* CTA Banner — only for non-logged-in users */}
      {!user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(255,101,132,0.2))' }}>
            <div className="absolute inset-0 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 relative">Get 20% Off Your First Order</h2>
            <p className="text-gray-300 mb-6 relative">Sign up today and get an exclusive discount on your first purchase.</p>
            <Link to="/register" className="btn-accent px-8 py-3 text-base relative no-underline">Create Account</Link>
          </div>
        </section>
      )}
    </div>
  );
}
