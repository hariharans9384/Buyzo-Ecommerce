import { Link, useNavigate } from 'react-router-dom';
import { HiTrash, HiMinus, HiPlus, HiArrowRight, HiShoppingBag, HiShieldCheck } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartCount, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpdateQty = async (productId, qty) => {
    try {
      await updateQuantity(productId, qty);
    } catch (err) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (productId, name) => {
    try {
      await removeFromCart(productId);
      toast.success(`${name || 'Item'} removed from cart`);
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast('Please sign in to proceed to checkout', { icon: '🔐' });
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fadeIn">
        <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 text-primary animate-float">
          <HiShoppingBag className="text-5xl" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-white mb-3">Your Cart is Empty</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm">
          Discover our curated collection of tech, audio, and urban accessories to populate your shopping bag.
        </p>
        <Link to="/products" className="btn-primary px-8 py-3.5 no-underline inline-flex items-center gap-2">
          Explore Products Catalog <HiArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Shopping Bag</h1>
        <p className="text-gray-400 text-sm mt-1">Review your items before proceeding to secure checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item Rows */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const pId = item.product?._id || item.product?.id || item.product;
            const pName = item.product?.name || 'Selected Product';
            const pCategory = item.product?.category || 'General';
            const pPrice = item.product?.price || 0;
            const pImg = item.product?.images?.[0] || item.product?.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60';

            return (
              <div key={pId} className="glass-strong rounded-2xl p-5 flex gap-4 sm:gap-6 items-center border border-white/10 shadow-lg">
                <Link to={`/products/${pId}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                  <img src={pImg} alt={pName} className="w-full h-full object-cover" />
                </Link>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-wider bg-secondary/10 px-2.5 py-0.5 rounded-full border border-secondary/20">
                    {pCategory}
                  </span>
                  <Link to={`/products/${pId}`} className="text-white font-bold text-sm sm:text-base hover:text-primary-light transition-colors no-underline line-clamp-1 mt-1 block">
                    {pName}
                  </Link>
                  <p className="text-white font-black text-base sm:text-lg mt-1">
                    ₹{pPrice.toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() => handleRemove(pId, pName)}
                    className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition bg-transparent border-none cursor-pointer"
                    title="Remove item"
                  >
                    <HiTrash className="text-lg" />
                  </button>

                  <div className="flex items-center bg-white/5 border border-white/15 rounded-xl">
                    <button
                      onClick={() => handleUpdateQty(pId, Math.max(1, item.quantity - 1))}
                      className="p-2 text-gray-300 hover:text-white bg-transparent border-none cursor-pointer"
                    >
                      <HiMinus className="text-xs" />
                    </button>
                    <span className="px-3 text-white text-xs sm:text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQty(pId, item.quantity + 1)}
                      className="p-2 text-gray-300 hover:text-white bg-transparent border-none cursor-pointer"
                    >
                      <HiPlus className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky Summary Card */}
        <div className="glass-strong rounded-3xl p-6 sm:p-8 border border-white/10 h-fit sticky top-24 shadow-2xl">
          <h2 className="text-xl font-serif font-bold text-white mb-6 tracking-tight">Summary Details</h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-gray-300 text-sm">
              <span>Items Total ({cartCount})</span>
              <span className="font-semibold text-white">₹{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-300 text-sm">
              <span>Estimated Shipping</span>
              <span className="text-emerald-400 font-bold">FREE</span>
            </div>
            <div className="border-t border-white/10 pt-4 flex justify-between text-white font-extrabold text-lg">
              <span>Total Amount</span>
              <span className="text-2xl gradient-text">₹{cartTotal.toLocaleString()}</span>
            </div>
          </div>

          <button onClick={handleCheckout} className="btn-accent w-full py-3.5 flex items-center justify-center gap-2 text-sm">
            {user ? 'Proceed to Checkout' : 'Sign In to Checkout'} <HiArrowRight />
          </button>

          <Link to="/products" className="btn-secondary w-full py-3 mt-3 text-center block no-underline text-sm">
            Continue Shopping
          </Link>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-6 pt-4 border-t border-white/10">
            <HiShieldCheck className="text-primary text-base" /> 256-Bit SSL Encrypted Checkout
          </div>
        </div>
      </div>
    </div>
  );
}
