import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HiLocationMarker, HiCreditCard, HiPlus, HiHome, HiOfficeBuilding, HiDotsCircleHorizontal, HiCheck, HiX, HiPhone, HiBadgeCheck } from 'react-icons/hi';
import API from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const addressIcons = { Home: HiHome, Office: HiOfficeBuilding, Other: HiDotsCircleHorizontal };

// Congrats Popup
function CongratsPopup({ open, orderId, onClose }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div style={{ background: 'rgba(26,26,46,0.98)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '420px', margin: '0 16px', boxShadow: '0 25px 60px rgba(108,99,255,0.2)', textAlign: 'center', position: 'relative' }} className="animate-slideIn">
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #6C63FF, #00D9A6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <HiBadgeCheck style={{ color: '#fff', fontSize: '40px' }} />
        </div>
        <h2 style={{ color: '#fff', fontSize: '26px', fontWeight: 800, margin: '0 0 8px' }}>Order Placed!</h2>
        <p style={{ color: '#9ca3af', fontSize: '15px', margin: '0 0 8px', lineHeight: '1.5' }}>Your order has been placed successfully.</p>
        {orderId && <p style={{ color: '#6C63FF', fontSize: '13px', fontWeight: 600, margin: '0 0 24px' }}>Order #{orderId.slice(-8).toUpperCase()}</p>}
        <button onClick={onClose} className="btn-accent" style={{ padding: '14px 0', fontSize: '15px', fontWeight: 600, width: '100%' }}>View My Orders</button>
        <div style={{ position: 'absolute', top: '-20px', left: '20%', fontSize: '24px', opacity: 0.6 }}>✨</div>
        <div style={{ position: 'absolute', top: '-10px', right: '25%', fontSize: '20px', opacity: 0.5 }}>🎊</div>
      </div>
    </div>,
    document.body
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isBuyNow = searchParams.get('buyNow') === 'true';
  const { cart, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'Home', phone: user?.phone || '', street: '', city: '', state: '', zipCode: '', country: 'India' });
  const [paying, setPaying] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [congrats, setCongrats] = useState({ open: false, orderId: null });
  const [orderPlaced, setOrderPlaced] = useState(false);
  // Ref to track order placed synchronously (avoids React async state batching race with clearCart)
  const orderPlacedRef = useRef(false);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'cod'
  const COD_FEE = 25;

  // Buy Now item from sessionStorage
  const [buyNowItem, setBuyNowItem] = useState(() => {
    if (searchParams.get('buyNow') === 'true') {
      const raw = sessionStorage.getItem('buyNowItem');
      return raw ? JSON.parse(raw) : null;
    }
    return null;
  });

  // Determine items and total
  const checkoutItems = isBuyNow && buyNowItem
    ? [buyNowItem]
    : (cart.items || []);
  const checkoutTotal = isBuyNow && buyNowItem
    ? buyNowItem.product.price * buyNowItem.quantity
    : cartTotal;

  useEffect(() => {
    API.get('/auth/profile').then(res => {
      const addrs = res.data.savedAddresses || [];
      setSavedAddresses(addrs);
      if (addrs.length > 0) setSelectedAddressId(addrs[0]._id);
      else setShowNewForm(true);
      if (!newAddress.phone && res.data.phone) setNewAddress(prev => ({ ...prev, phone: res.data.phone }));
    }).catch(console.error);
  }, []);

  // On mount: if a pendingOrderId exists in sessionStorage, the user refreshed mid-payment
  // The order is already saved in DB — send them to Orders page to complete/view it
  useEffect(() => {
    const pendingId = sessionStorage.getItem('pendingCheckoutOrderId');
    if (pendingId) {
      sessionStorage.removeItem('pendingCheckoutOrderId');
      toast('Your order was saved. Complete payment from My Orders.', { icon: '⏳', duration: 4000 });
      navigate('/orders');
    }
  }, []);

  // Redirect if no items and order hasn't been placed
  useEffect(() => {
    if (checkoutItems.length === 0 && !orderPlacedRef.current && !congrats.open) {
      navigate('/cart');
    }
  }, [checkoutItems.length, congrats.open, navigate]);

  const handleSaveNewAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) { toast.error('Please fill all address fields'); return null; }
    if (!newAddress.phone) { toast.error('Phone number is required'); return null; }
    if (saveAddress) {
      try {
        const res = await API.post('/auth/addresses', newAddress);
        const addrs = res.data.savedAddresses;
        setSavedAddresses(addrs);
        const a = addrs[addrs.length - 1];
        setSelectedAddressId(a._id);
        setShowNewForm(false);
        toast.success('Address saved!');
        return a;
      } catch (err) { toast.error('Failed to save address'); return null; }
    }
    return newAddress;
  };

  const getShippingAddress = () => {
    if (showNewForm || !selectedAddressId) return newAddress;
    return savedAddresses.find(a => a._id === selectedAddressId) || newAddress;
  };

  const placeOrder = async (paymentData = {}) => {
    const address = showNewForm ? await handleSaveNewAddress() : getShippingAddress();
    if (!address || !address.street) { toast.error('Please provide a shipping address'); return; }

    try {
      const orderItems = checkoutItems.map(i => ({ product: i.product._id, quantity: i.quantity }));
      const finalTotal = checkoutTotal + (paymentData.paymentMethod === 'cod' ? (paymentData.codFee || 0) : 0);
      const res = await API.post('/orders', {
        items: orderItems,
        totalAmount: finalTotal,
        shippingAddress: address,
        ...paymentData
      });
      // Mark order as placed synchronously via ref BEFORE clearing cart
      // to prevent the redirect useEffect from firing during clearCart
      orderPlacedRef.current = true;
      setOrderPlaced(true);
      // Show congrats popup first
      setCongrats({ open: true, orderId: res.data._id });
      // Then clear cart (won't trigger redirect because orderPlacedRef is already true)
      if (!isBuyNow) await clearCart();
      // Clear buyNow item
      sessionStorage.removeItem('buyNowItem');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    }
  };

  const handleRazorpay = async () => {
    const address = showNewForm ? await handleSaveNewAddress() : getShippingAddress();
    if (!address || !address.street) { toast.error('Please provide a shipping address'); return; }

    setPaying(true);
    try {
      const orderItems = checkoutItems.map(i => ({ product: i.product._id, quantity: i.quantity }));

      // Step 1: Create Razorpay order AND a pending DB order (order is saved before payment popup)
      const { data } = await API.post('/payment/create-order', {
        amount: checkoutTotal,
        items: orderItems,
        shippingAddress: address
      });

      // Save pendingOrderId so if user refreshes, they get redirected to Orders page
      sessionStorage.setItem('pendingCheckoutOrderId', data.dbOrderId);

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: 'INR',
        name: 'Dudez_Shop',
        description: 'Order Payment',
        order_id: data.orderId,
        handler: async (response) => {
          let verified = false;
          try {
            // Step 2: Verify payment and update the existing order to 'paid'
            await API.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              dbOrderId: data.dbOrderId
            });
            verified = true;
          } catch (err) {
            // Verify failed — order is saved as 'pending', user can retry from Orders page
            toast.error('Payment done but verification pending. Check My Orders to complete.', { duration: 7000 });
            navigate('/orders');
          } finally {
            setPaying(false);
          }

          if (verified) {
            // Order successfully verified and marked 'paid' — show success UI
            sessionStorage.removeItem('pendingCheckoutOrderId');
            sessionStorage.removeItem('buyNowItem');
            // Clear frontend cart state (backend already deleted cart in create-order)
            if (!isBuyNow) await clearCart();
            orderPlacedRef.current = true;
            setOrderPlaced(true);
            setCongrats({ open: true, orderId: data.dbOrderId });
          }
        },
        modal: {
          ondismiss: () => {
            // User closed Razorpay popup without paying — order stays as 'pending'
            toast('Payment cancelled. Your order is saved as pending.', { icon: '⏳', duration: 4000 });
            setPaying(false);
            // Show congrats with pending status and redirect to orders
            orderPlacedRef.current = true;
            setOrderPlaced(true);
            sessionStorage.removeItem('pendingCheckoutOrderId');
            if (!isBuyNow) clearCart();
            sessionStorage.removeItem('buyNowItem');
            navigate('/orders');
          }
        },
        prefill: { name: user?.name, email: user?.email, contact: address.phone || user?.phone },
        theme: { color: '#6C63FF' }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (response) => {
        toast.error(`Payment failed: ${response.error.description}. Your order has been cancelled.`, { duration: 5000 });
        setPaying(false);
        // Mark the pending order as failed on backend (restores stock)
        try {
          await API.post('/payment/failed', {
            dbOrderId: data.dbOrderId,
            errorDescription: response.error.description,
            errorCode: response.error.code
          });
        } catch { /* silent */ }
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create payment order');
      setPaying(false);
    }
  };

  // If no items, we either show nothing (loader) or rely on useEffect to redirect
  if (checkoutItems.length === 0 && !congrats.open && !orderPlaced) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <CongratsPopup open={congrats.open} orderId={congrats.orderId} onClose={() => { setCongrats({ open: false, orderId: null }); navigate('/orders'); }} />

      <h1 className="text-3xl font-bold text-white mb-2">Checkout</h1>
      {isBuyNow && <p className="text-primary text-sm mb-6">⚡ Buy Now — purchasing this item directly</p>}
      {!isBuyNow && <p className="text-gray-400 text-sm mb-6">{checkoutItems.length} item(s) from your cart</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-strong rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><HiLocationMarker className="text-primary" /> Shipping Address</h2>

            {savedAddresses.length > 0 && (
              <div className="space-y-3 mb-4">
                {savedAddresses.map(addr => {
                  const Icon = addressIcons[addr.label] || HiDotsCircleHorizontal;
                  return (
                    <div key={addr._id} onClick={() => { setSelectedAddressId(addr._id); setShowNewForm(false); }}
                      className={`glass rounded-xl p-4 cursor-pointer transition-all flex items-start gap-3 ${selectedAddressId === addr._id && !showNewForm ? 'ring-2 ring-primary' : 'hover:bg-white/5'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedAddressId === addr._id && !showNewForm ? 'bg-primary/20' : 'bg-white/5'}`}>
                        <Icon className={`text-lg ${selectedAddressId === addr._id && !showNewForm ? 'text-primary' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">{addr.label}</span>
                          {selectedAddressId === addr._id && !showNewForm && <HiCheck className="text-primary" />}
                        </div>
                        {addr.phone && <p className="text-gray-400 text-xs flex items-center gap-1"><HiPhone className="text-xs" /> {addr.phone}</p>}
                        <p className="text-gray-300 text-sm">{addr.street}</p>
                        <p className="text-gray-400 text-xs">{addr.city}, {addr.state} - {addr.zipCode}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!showNewForm && (
              <button onClick={() => { setShowNewForm(true); setSelectedAddressId(null); }} className="btn-secondary w-full py-3 flex items-center justify-center gap-2 mb-4"><HiPlus /> Add New Address</button>
            )}

            {showNewForm && (
              <div className="glass rounded-xl p-4 animate-fadeIn space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium text-sm">New Address</h3>
                  {savedAddresses.length > 0 && <button onClick={() => { setShowNewForm(false); setSelectedAddressId(savedAddresses[0]._id); }} className="text-gray-400 hover:text-white bg-transparent border-none cursor-pointer"><HiX /></button>}
                </div>
                <div className="flex gap-2">
                  {['Home', 'Office', 'Other'].map(label => {
                    const LIcon = addressIcons[label];
                    return (
                      <button key={label} onClick={() => setNewAddress({ ...newAddress, label })}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition border-none cursor-pointer ${newAddress.label === label ? 'bg-primary/20 text-primary' : 'glass text-gray-400 hover:text-white'}`}>
                        <LIcon /> {label}
                      </button>
                    );
                  })}
                </div>
                <div className="relative">
                  <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} className="input-field pl-10" placeholder="Phone Number *" type="tel" />
                </div>
                <input value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} className="input-field" placeholder="Street Address *" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} className="input-field" placeholder="City *" />
                  <input value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} className="input-field" placeholder="State *" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input value={newAddress.zipCode} onChange={e => setNewAddress({ ...newAddress, zipCode: e.target.value })} className="input-field" placeholder="ZIP Code *" />
                  <input value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} className="input-field" placeholder="Country" />
                </div>
                <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer">
                  <input type="checkbox" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} className="cursor-pointer" /> Save for future orders
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="glass-strong rounded-xl p-6 h-fit sticky top-20">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><HiCreditCard className="text-accent" /> Order Summary</h2>
          <div className="space-y-3 mb-4">
            {checkoutItems.map((item, idx) => (
              <div key={item.product?._id || idx} className="flex items-center gap-3">
                <img src={item.product?.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm line-clamp-1">{item.product?.name}</p>
                  <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                </div>
                <span className="text-white text-sm font-medium">₹{(item.product?.price * item.quantity)?.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-3 space-y-2">
            <div className="flex justify-between text-gray-300 text-sm"><span>Subtotal</span><span>₹{checkoutTotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-300 text-sm"><span>Shipping</span><span className="text-success">Free</span></div>
            {paymentMethod === 'cod' && (
              <div className="flex justify-between text-gray-300 text-sm"><span>COD Fee</span><span className="text-warning">₹{COD_FEE}</span></div>
            )}
            <div className="border-t border-white/10 pt-2 flex justify-between text-white font-bold text-lg"><span>Total</span><span>₹{(checkoutTotal + (paymentMethod === 'cod' ? COD_FEE : 0)).toLocaleString()}</span></div>
          </div>

          {/* Payment Method Selection */}
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-400 font-medium">Payment Method</p>
            <div className="flex gap-2">
              <button onClick={() => setPaymentMethod('online')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${paymentMethod === 'online' ? 'bg-primary/20 text-primary ring-2 ring-primary' : 'glass text-gray-400 hover:text-white'}`}>
                <HiCreditCard /> Online Pay
              </button>
              <button onClick={() => setPaymentMethod('cod')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${paymentMethod === 'cod' ? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-500' : 'glass text-gray-400 hover:text-white'}`}>
                💵 COD (+₹{COD_FEE})
              </button>
            </div>
          </div>

          {paymentMethod === 'online' ? (
            <button onClick={handleRazorpay} disabled={paying} className="btn-accent w-full py-3 mt-4 flex items-center justify-center gap-2 disabled:opacity-50">
              <HiCreditCard /> {paying ? 'Processing...' : `Pay ₹${checkoutTotal.toLocaleString()}`}
            </button>
          ) : (
            <button onClick={() => placeOrder({ paymentMethod: 'cod', codFee: COD_FEE })} disabled={paying} className="btn-accent w-full py-3 mt-4 flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff' }}>
              💵 {paying ? 'Placing...' : `Place Order — ₹${(checkoutTotal + COD_FEE).toLocaleString()} (COD)`}
            </button>
          )}
          <p className="text-gray-500 text-xs text-center mt-3">🔒 Your payment is secure and encrypted</p>
        </div>
      </div>
    </div>
  );
}
