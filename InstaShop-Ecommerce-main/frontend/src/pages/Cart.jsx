import { Link, useNavigate } from 'react-router-dom';
import { HiTrash, HiMinus, HiPlus, HiArrowRight, HiShoppingBag } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartCount, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpdateQty = async (productId, qty) => {
    try { await updateQuantity(productId, qty); } catch (err) { toast.error('Failed to update'); }
  };
  const handleRemove = async (productId, name) => {
    try { await removeFromCart(productId); toast.success(`${name} removed`); } catch (err) { toast.error('Failed to remove'); }
  };

  const handleCheckout = () => {
    if (!user) {
      toast('Please login to checkout', { icon: '🔐' });
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-fadeIn">
        <HiShoppingBag className="text-6xl text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-6">Looks like you haven't added any items yet.</p>
        <Link to="/products" className="btn-primary px-8 py-3 no-underline">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart <span className="text-gray-400 text-lg font-normal">({cartCount} items)</span></h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => (
            <div key={item.product?._id} className="glass rounded-xl p-4 flex gap-4 animate-slideIn">
              <Link to={`/products/${item.product?._id}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                <img src={item.product?.image} alt={item.product?.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product?._id}`} className="text-white font-semibold text-sm sm:text-base hover:text-primary transition-colors no-underline line-clamp-1">{item.product?.name}</Link>
                <p className="text-primary text-xs mt-0.5">{item.product?.category}</p>
                <p className="text-white font-bold mt-1">₹{item.product?.price?.toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button onClick={() => handleRemove(item.product?._id, item.product?.name)} className="text-gray-400 hover:text-red-400 transition bg-transparent border-none cursor-pointer"><HiTrash /></button>
                <div className="flex items-center glass rounded-lg">
                  <button onClick={() => handleUpdateQty(item.product?._id, Math.max(1, item.quantity - 1))} className="p-1.5 text-gray-400 hover:text-white bg-transparent border-none cursor-pointer"><HiMinus className="text-xs" /></button>
                  <span className="px-3 text-white text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => handleUpdateQty(item.product?._id, item.quantity + 1)} className="p-1.5 text-gray-400 hover:text-white bg-transparent border-none cursor-pointer"><HiPlus className="text-xs" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="glass-strong rounded-xl p-6 h-fit sticky top-20">
          <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-300 text-sm"><span>Subtotal ({cartCount} items)</span><span>₹{cartTotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-300 text-sm"><span>Shipping</span><span className="text-success">Free</span></div>
            <div className="border-t border-white/10 pt-3 flex justify-between text-white font-bold"><span>Total</span><span className="text-xl">₹{cartTotal.toLocaleString()}</span></div>
          </div>
          <button onClick={handleCheckout} className="btn-accent w-full py-3 flex items-center justify-center gap-2">
            {user ? 'Proceed to Checkout' : 'Login to Checkout'} <HiArrowRight />
          </button>
          <Link to="/products" className="btn-secondary w-full py-2.5 mt-3 text-center block no-underline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
