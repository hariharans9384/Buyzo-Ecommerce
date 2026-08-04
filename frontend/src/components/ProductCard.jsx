import { Link } from 'react-router-dom';
import { HiShoppingCart, HiStar } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const productId = product._id || product.id;
  const stockCount = product.stock !== undefined ? product.stock : (product.inStock !== undefined ? product.inStock : 10);

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (addToCart) {
        await addToCart(productId);
      }
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const imgSrc = product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60';

  return (
    <Link to={`/products/${productId}`} className="card group block no-underline">
      <div className="relative overflow-hidden aspect-square">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 badge text-dark text-xs px-2 py-1 rounded-md font-bold shadow-md" style={{ background: 'linear-gradient(135deg, #E29578, #D4AF37)' }}>
            {discount}% OFF
          </span>
        )}
        {stockCount <= 5 && stockCount > 0 && (
          <span className="absolute top-3 right-3 badge bg-amber-500/90 text-black font-semibold text-xs px-2 py-1 rounded-md">
            Only {stockCount} left
          </span>
        )}
        {stockCount === 0 && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
            <span className="text-white font-bold text-sm uppercase tracking-wider bg-black/50 px-3 py-1.5 rounded-lg border border-white/20">Out of Stock</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <button
          onClick={handleAdd}
          disabled={stockCount === 0}
          className="absolute bottom-3 right-3 btn-primary py-2 px-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border-none cursor-pointer"
        >
          <HiShoppingCart className="text-sm" /> Add to Cart
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-xs text-secondary font-semibold uppercase tracking-wider">{product.category}</p>
          {product.brand && <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">{product.brand}</span>}
        </div>
        <h3 className="text-white font-semibold text-sm mb-2 line-clamp-1 group-hover:text-primary-light transition-colors">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <HiStar key={i} className={`text-sm ${i < Math.floor(product.rating || 4.5) ? 'text-amber-400' : 'text-gray-600'}`} />
          ))}
          <span className="text-gray-400 text-xs ml-1 font-medium">({product.numReviews || 12})</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-lg">₹{product.price?.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-gray-500 text-xs line-through">₹{product.originalPrice?.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
