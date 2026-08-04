import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HiLocationMarker, HiCreditCard, HiPlus, HiHome, HiOfficeBuilding, HiDotsCircleHorizontal, HiCheck, HiX, HiPhone, HiBadgeCheck, HiShieldCheck } from 'react-icons/hi';
import API from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const addressIcons = { Home: HiHome, Office: HiOfficeBuilding, Other: HiDotsCircleHorizontal };

function CongratsPopup({ open, orderId, onClose }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
      <div style={{ background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '440px', margin: '0 16px', boxShadow: '0 25px 60px rgba(99,102,241,0.3)', textAlign: 'center', position: 'relative' }} className="animate-fadeIn">
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 30px rgba(99,102,241,0.4)' }}>
          <HiBadgeCheck style={{ color: '#fff', fontSize: '44px' }} />
        </div>
        <h2 style={{ color: '#fff', fontSize: '26px', fontWeight: 800, margin: '0 0 8px', tracking: '-0.025em' }}>Order Placed Successfully!</h2>
        <p style={{ color: '#94A3B8', fontSize: '14px', margin: '0 0 12px', lineHeight: '1.6' }}>Thank you for shopping with Buyzo. We have received your order.</p>
        {orderId && <p style={{ color: '#818CF8', fontSize: '13px', fontWeight: 700, margin: '0 0 24px', background: 'rgba(99,102,241,0.1)', padding: '6px 12px', borderRadius: '8px', display: 'inline-block' }}>Order #{orderId.slice(-8).toUpperCase()}</p>}
        <button onClick={onClose} className="btn-primary" style={{ padding: '14px 0', fontSize: '15px', fontWeight: 700, width: '100%' }}>View My Orders & Track</button>
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
  const orderPlacedRef = useRef(false);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const COD_FEE = 25;

  const [buyNowItem, setBuyNowItem] = useState(() => {
    if (searchParams.get('buyNow') === 'true') {
      const raw = sessionStorage.getItem('buyNowItem');
      return raw ? JSON.parse(raw) : null;
    }
    return null;
  });

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

  useEffect(() => {
    const pendingId = sessionStorage.getItem('pendingCheckoutOrderId');
    if (pendingId) {
      sessionStorage.removeItem('pendingCheckoutOrderId');
      toast('Your order was saved. Complete payment from My Orders.', { icon: '⏳', duration: 4000 });
      navigate('/orders');
    }
  }, [navigate]);

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
      const orderItems = checkoutItems.map(i => ({ product: i.product._id || i.product.id, quantity: i.quantity }));
      const finalTotal = checkoutTotal + (paymentData.paymentMethod === 'cod' ? (paymentData.codFee || 0) : 0);
      const res = await API.post('/orders', {
        items: orderItems,
        totalAmount: finalTotal,
        shippingAddress: address,
        ...paymentData
      });
      orderPlacedRef.current = true;
      setOrderPlaced(true);
      setCongrats({ open: true, orderId: res.data._id });
      if (!isBuyNow) await clearCart();
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
      const orderItems = checkoutItems.map(i => ({ product: i.product._id || i.product.id, quantity: i.quantity }));
      const { data } = await API.post('/payment/create-order', {
        amount: checkoutTotal,
        items: orderItems,
        shippingAddress: address
      });

      sessionStorage.setItem('pendingCheckoutOrderId', data.dbOrderId);

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: 'INR',
        name: 'Buyzo',
        description: 'Order Payment',
        order_id: data.orderId,
        handler: async (response) => {
          let verified = false;
          try {
            await API.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              dbOrderId: data.dbOrderId
            });
            verified = true;
          } catch (err) {
            toast.error('Payment done but verification pending. Check My Orders to complete.', { duration: 7000 });
            navigate('/orders');
          } finally {
            setPaying(false);
          }

          if (verified) {
            sessionStorage.removeItem('pendingCheckoutOrderId');
            sessionStorage.removeItem('buyNowItem');
            if (!isBuyNow) await clearCart();
            orderPlacedRef.current = true;
            setOrderPlaced(true);
            setCongrats({ open: true, orderId: data.dbOrderId });
          }
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled. Your order is saved as pending.', { icon: '⏳', duration: 4000 });
            setPaying(false);
            orderPlacedRef.current = true;
            setOrderPlaced(true);
            sessionStorage.removeItem('pendingCheckoutOrderId');
            if (!isBuyNow) clearCart();
            sessionStorage.removeItem('buyNowItem');
            navigate('/orders');
          }
        },
        prefill: { name: user?.name, email: user?.email, contact: address.phone || user?.phone },
        theme: { color: '#6366F1' }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (response) => {
        toast.error(`Payment failed: ${response.error.description}.`, { duration: 5000 });
        setPaying(false);
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

  if (checkoutItems.length === 0 && !congrats.open && !orderPlaced) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <CongratsPopup open={congrats.open} orderId={congrats.orderId} onClose={() => { setCongrats({ open: false, orderId: null }); navigate('/orders'); }} />

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Checkout</h1>
        {isBuyNow && <p className="text-indigo-400 text-sm mt-1 font-semibold">⚡ Direct Express Checkout</p>}
        {!isBuyNow && <p className="text-gray-400 text-sm mt-1">Order summary for {checkoutItems.length} item(s)</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Shipping Address */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-strong rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 tracking-tight">
              <HiLocationMarker className="text-indigo-400" /> Shipping & Delivery Address
            </h2>

            {savedAddresses.length > 0 && (
              <div className="space-y-3 mb-6">
                {savedAddresses.map(addr => {
                  const Icon = addressIcons[addr.label] || HiDotsCircleHorizontal;
                  const isSelected = selectedAddressId === addr._id && !showNewForm;
                  return (
                    <div
                      key={addr._id}
                      onClick={() => { setSelectedAddressId(addr._id); setShowNewForm(false); }}
                      className={`glass rounded-2xl p-5 cursor-pointer transition-all flex items-start gap-4 border ${isSelected ? 'border-indigo-500 bg-indigo-500/10 shadow-md' : 'border-white/10 hover:border-white/20'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400'}`}>
                        <Icon className="text-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-sm">{addr.label}</span>
                          {isSelected && <HiCheck className="text-indigo-400 font-bold" />}
                        </div>
                        {addr.phone && <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5"><HiPhone className="text-xs" /> {addr.phone}</p>}
                        <p className="text-gray-300 text-sm mt-1">{addr.street}</p>
                        <p className="text-gray-400 text-xs">{addr.city}, {addr.state} - {addr.zipCode}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!showNewForm && (
              <button
                onClick={() => { setShowNewForm(true); setSelectedAddressId(null); }}
                className="btn-secondary w-full py-3.5 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl"
              >
                <HiPlus /> Add Custom Address
              </button>
            )}

            {showNewForm && (
              <div className="glass rounded-2xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-sm">Enter New Shipping Address</h3>
                  {savedAddresses.length > 0 && (
                    <button onClick={() => { setShowNewForm(false); setSelectedAddressId(savedAddresses[0]._id); }} className="text-gray-400 hover:text-white bg-transparent border-none cursor-pointer">
                      <HiX />
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  {['Home', 'Office', 'Other'].map(label => {
                    const LIcon = addressIcons[label];
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setNewAddress({ ...newAddress, label })}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition border-none cursor-pointer ${newAddress.label === label ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                      >
                        <LIcon /> {label}
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <HiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={newAddress.phone}
                    onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="input-field pl-10"
                    placeholder="Mobile Contact Number *"
                    type="tel"
                  />
                </div>

                <input
                  value={newAddress.street}
                  onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                  className="input-field"
                  placeholder="House No / Street / Landmark *"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} className="input-field" placeholder="City *" />
                  <input value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} className="input-field" placeholder="State *" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input value={newAddress.zipCode} onChange={e => setNewAddress({ ...newAddress, zipCode: e.target.value })} className="input-field" placeholder="Postal PIN Code *" />
                  <input value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} className="input-field" placeholder="Country" />
                </div>

                <label className="flex items-center gap-2 text-gray-300 text-xs font-medium cursor-pointer">
                  <input type="checkbox" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} className="rounded text-indigo-600 cursor-pointer" /> Save this address to profile
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Payment */}
        <div className="glass-strong rounded-3xl p-6 sm:p-8 border border-white/10 h-fit sticky top-24 shadow-2xl space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
            <HiCreditCard className="text-indigo-400" /> Order Summary
          </h2>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {checkoutItems.map((item, idx) => {
              const pName = item.product?.name || 'Product Item';
              const pPrice = item.product?.price || 0;
              const pImg = item.product?.images?.[0] || item.product?.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60';
              return (
                <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <img src={pImg} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold line-clamp-1">{pName}</p>
                    <p className="text-gray-400 text-[10px]">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-white text-xs font-bold">₹{(pPrice * item.quantity).toLocaleString()}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2.5">
            <div className="flex justify-between text-gray-300 text-xs sm:text-sm">
              <span>Subtotal</span>
              <span className="font-semibold text-white">₹{checkoutTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-300 text-xs sm:text-sm">
              <span>Delivery Charges</span>
              <span className="text-emerald-400 font-bold">FREE</span>
            </div>
            {paymentMethod === 'cod' && (
              <div className="flex justify-between text-gray-300 text-xs sm:text-sm">
                <span>COD Handling Surcharge</span>
                <span className="text-amber-400 font-bold">₹{COD_FEE}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-3 flex justify-between text-white font-extrabold text-lg">
              <span>Final Total</span>
              <span className="gradient-text text-xl">₹{(checkoutTotal + (paymentMethod === 'cod' ? COD_FEE : 0)).toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <p className="text-xs text-gray-300 font-semibold uppercase tracking-wider">Select Payment Option</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${paymentMethod === 'online' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'}`}
              >
                <HiCreditCard /> Razorpay / UPI
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${paymentMethod === 'cod' ? 'bg-amber-500 text-black shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'}`}
              >
                💵 COD (+₹{COD_FEE})
              </button>
            </div>
          </div>

          {paymentMethod === 'online' ? (
            <button onClick={handleRazorpay} disabled={paying} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
              <HiCreditCard /> {paying ? 'Connecting Payment...' : `Pay ₹${checkoutTotal.toLocaleString()}`}
            </button>
          ) : (
            <button
              onClick={() => placeOrder({ paymentMethod: 'cod', codFee: COD_FEE })}
              disabled={paying}
              className="btn-accent w-full py-3.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff' }}
            >
              💵 {paying ? 'Placing Order...' : `Confirm Order — ₹${(checkoutTotal + COD_FEE).toLocaleString()} (COD)`}
            </button>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-2">
            <HiShieldCheck className="text-emerald-400 text-base" /> Safe & Verified Checkout
          </div>
        </div>
      </div>
    </div>
  );
}
