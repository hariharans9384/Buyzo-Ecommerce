import { Link } from 'react-router-dom';
import { HiShoppingCart, HiStar } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product._id);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const imgSrc = product.images?.[0] || product.image || 'https://via.placeholder.com/300';

  return (
    <Link to={`/products/${product._id}`} className="card group block no-underline">
      <div className="relative overflow-hidden aspect-square">
        <img src={imgSrc} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
        {discount > 0 && (
          <span className="absolute top-3 left-3 badge text-white text-xs" style={{ background: 'linear-gradient(135deg, #FF6584, #FF4567)' }}>{discount}% OFF</span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-3 right-3 badge bg-warning/90 text-dark text-xs">Only {product.stock} left</span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-white font-bold text-lg">Out of Stock</span></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <button onClick={handleAdd} disabled={product.stock === 0}
          className="absolute bottom-3 right-3 btn-primary py-2 px-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
          <HiShoppingCart /> Add
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs text-primary font-medium mb-1 uppercase tracking-wider">{product.category}</p>
        <h3 className="text-white font-semibold text-sm mb-2 line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => <HiStar key={i} className={`text-sm ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-600'}`} />)}
          <span className="text-gray-400 text-xs ml-1">({product.numReviews})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-lg">₹{product.price?.toLocaleString()}</span>
          {product.originalPrice && <span className="text-gray-500 text-sm line-through">₹{product.originalPrice?.toLocaleString()}</span>}
        </div>
      </div>
    </Link>
  );
}
