import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiShoppingBag, HiTruck, HiShieldCheck, HiRefresh, HiSparkles, HiStar } from 'react-icons/hi';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import jsonProducts from '../data/products.json';

export default function Home() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/products?limit=8&sort=rating'),
      API.get('/products/categories')
    ])
      .then(([prodRes, catRes]) => {
        if (prodRes.data?.products && prodRes.data.products.length > 0) {
          setFeatured(prodRes.data.products);
        } else {
          setFeatured(jsonProducts.slice(0, 8));
        }
        if (Array.isArray(catRes.data) && catRes.data.length > 0) {
          setCategories(catRes.data);
        } else {
          const jsonCats = Array.from(new Set(jsonProducts.map(p => p.category)));
          setCategories(jsonCats);
        }
      })
      .catch(() => {
        setFeatured(jsonProducts.slice(0, 8));
        const jsonCats = Array.from(new Set(jsonProducts.map(p => p.category)));
        setCategories(jsonCats);
      })
      .finally(() => setLoading(false));
  }, []);

  const features = [
    { icon: HiTruck, title: 'Express Delivery', desc: 'Fast & Reliable Shipping' },
    { icon: HiShieldCheck, title: '100% Encrypted', desc: 'Razorpay & COD Supported' },
    { icon: HiRefresh, title: 'Easy Returns', desc: '7-Day Hassel-Free Exchange' },
    { icon: HiShoppingBag, title: 'Verified Quality', desc: 'Premium Curated Products' },
  ];

  return (
    <div className="animate-fadeIn space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 bg-gradient-to-br from-dark-light/95 via-surface/90 to-dark-light/90 border border-primary/15 shadow-[0_20px_50px_rgba(212,175,55,0.05)] animate-float">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 badge bg-primary/10 text-primary border border-primary/20 mb-6 px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide">
              <HiSparkles /> Premium E-Commerce Experience 2026
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black mb-6 tracking-tight leading-tight text-white">
              Discover Next-Gen <br className="hidden sm:inline" />
              <span className="gradient-text">Lifestyle & Tech</span>
            </h1>
            <p className="text-gray-300 text-base sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              Explore our handpicked collection of high-performance wireless audio, titanium wearables, gaming gear, and urban fashion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-primary px-8 py-3.5 text-base flex items-center justify-center gap-2 no-underline">
                Shop Full Catalog <HiArrowRight />
              </Link>
              <Link to="/products?category=Audio" className="btn-secondary px-8 py-3.5 text-base no-underline text-center">
                Explore Audio Gear
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {features.map((f, i) => (
            <div key={i} className="glass rounded-2xl p-5 text-center group hover:border-primary/45 transition-all duration-300 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center mx-auto mb-3 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-dark transition-all duration-300">
                <f.icon className="text-2xl" />
              </div>
              <h3 className="text-white font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-gray-400 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">Shop by Category</h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Browse products grouped by specialized collections</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="glass rounded-2xl p-6 text-center group hover:border-primary/40 hover:bg-white/5 transition-all duration-300 no-underline shadow-md flex flex-col items-center justify-center gap-2"
              >
                <span className="text-2xl text-primary group-hover:scale-125 transition-transform duration-300">✨</span>
                <h3 className="text-white font-bold text-sm group-hover:text-primary-light transition-colors">{cat}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">Trending Products</h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Top-rated items favored by our shoppers</p>
          </div>
          <Link to="/products" className="text-primary hover:text-primary-light flex items-center gap-1.5 text-sm font-bold no-underline transition">
            View All Products <HiArrowRight />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse h-72 bg-white/5 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Promo Banner for non-logged-in users */}
      {!user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden bg-gradient-to-r from-dark-light via-surface to-dark-light border border-primary/20 shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 relative tracking-tight">
              Unlock Exclusive VIP Discounts
            </h2>
            <p className="text-gray-300 text-sm sm:text-base mb-8 max-w-xl mx-auto relative">
              Register your Buyzo account today to receive special coupons, express checkout access, and early order tracking.
            </p>
            <Link to="/register" className="btn-accent px-8 py-3.5 text-base relative no-underline inline-flex items-center gap-2">
              <HiSparkles /> Create Free Account
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
