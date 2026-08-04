import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { HiClipboardList, HiRefresh, HiDownload, HiX, HiEye, HiArrowLeft, HiExclamation, HiCurrencyRupee, HiPhone, HiCreditCard, HiBadgeCheck, HiTruck, HiCheckCircle } from 'react-icons/hi';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const statusColors = {
  placed: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  shipped: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  delivered: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  cancelled: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  returned: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
};

const paymentStatusColors = {
  pending: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  paid: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  failed: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  refunded: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
};

const paymentStatusIcons = {
  pending: '⏳',
  paid: '✅',
  success: '✅',
  failed: '❌',
  refunded: '↩️',
};

const timelineIcons = { placed: '📦', shipped: '🚚', delivered: '✅', cancelled: '❌', returned: '🔄', return_requested: '📋' };

function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }} onClick={onCancel}>
      <div style={{ background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '400px', margin: '0 16px', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }} className="animate-fadeIn" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiExclamation style={{ color: '#ef4444', fontSize: '22px' }} />
          </div>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '18px', margin: 0 }}>{title}</h3>
        </div>
        <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onConfirm} className="btn-danger" style={{ flex: 1, padding: '10px 0' }}>Yes, Cancel</button>
          <button onClick={onCancel} className="btn-secondary" style={{ flex: 1, padding: '10px 0' }}>No, Keep Order</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function PaymentSuccessPopup({ open, orderId, onClose }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div style={{ background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '400px', margin: '0 16px', textAlign: 'center', position: 'relative' }} className="animate-fadeIn">
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <HiBadgeCheck style={{ color: '#fff', fontSize: '36px' }} />
        </div>
        <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: '0 0 8px' }}>Payment Successful!</h2>
        <p style={{ color: '#94A3B8', fontSize: '14px', margin: '0 0 8px' }}>Your order has been confirmed.</p>
        {orderId && <p style={{ color: '#818CF8', fontSize: '13px', fontWeight: 600, margin: '0 0 24px' }}>Order #{orderId.slice(-8).toUpperCase()}</p>}
        <button onClick={onClose} className="btn-accent" style={{ padding: '12px 0', width: '100%', fontWeight: 600 }}>View Orders</button>
      </div>
    </div>,
    document.body
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnItemsForm, setReturnItemsForm] = useState([]);
  const [returningId, setReturningId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelModal, setCancelModal] = useState({ open: false, orderId: null });
  const [retryPaying, setRetryPaying] = useState(null);
  const [paySuccessPopup, setPaySuccessPopup] = useState({ open: false, orderId: null });
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchOrders = () => {
    API.get('/orders')
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleViewDetails = async (id) => {
    setDetailLoading(true);
    setSelectedOrder(null);
    try {
      const res = await API.get(`/orders/${id}`);
      setSelectedOrder(res.data);
    } catch {
      toast.error('Failed to load order details');
      const fallback = orders.find(o => o._id === id);
      if (fallback) setSelectedOrder(fallback);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancel = async () => {
    const id = cancelModal.orderId;
    setCancelModal({ open: false, orderId: null });
    try {
      await API.post(`/orders/${id}/cancel`);
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const startReturn = (order) => {
    setSelectedOrder(order);
    setReturningId(order._id);
    setReturnReason('');
    const availableItems = order.items
      .map(i => ({
        product: i.product?._id || i.product,
        name: i.name || i.product?.name,
        price: i.price,
        quantity: 1,
        max: i.quantity - (i.returnedQuantity || 0),
        selected: false
      }))
      .filter(i => i.max > 0);
    setReturnItemsForm(availableItems);
  };

  const handleReturn = async (id) => {
    if (!returnReason.trim()) { toast.error('Please provide a reason'); return; }
    const selectedItems = returnItemsForm.filter(i => i.selected);
    if (selectedItems.length === 0) { toast.error('Please select at least one item'); return; }

    try {
      await API.post(`/orders/${id}/return`, {
        reason: returnReason,
        items: selectedItems.map(i => ({ product: i.product, quantity: i.quantity }))
      });
      toast.success('Return request submitted!');
      setReturningId(null);
      setReturnReason('');
      setReturnItemsForm([]);
      fetchOrders();
      if (selectedOrder?._id === id) {
        setSelectedOrder({ ...selectedOrder, returnRequest: { requested: true, status: 'pending', reason: returnReason } });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit return');
    }
  };

  const downloadInvoice = async (id) => {
    try {
      const res = await API.get(`/orders/${id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${id.slice(-8)}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded');
    } catch {
      toast.error('Failed to download invoice');
    }
  };

  const canCancel = o => o.orderStatus === 'placed';
  const canRetryPayment = o => o.paymentStatus === 'pending' && o.paymentMethod === 'online' && o.orderStatus === 'placed';
  const canReturn = o => {
    if (o.orderStatus !== 'delivered' || o.returnRequest?.status === 'pending') return false;
    const hasUnreturnedItems = o.items.some(i => i.quantity > (i.returnedQuantity || 0));
    if (!hasUnreturnedItems) return false;
    return Math.ceil((Date.now() - new Date(o.createdAt)) / 86400000) <= 7;
  };
  const orderHasRefunds = o => o.refund?.status && o.refund.status !== 'none';

  const handleRetryPayment = async (order) => {
    setRetryPaying(order._id);
    try {
      const { data } = await API.post(`/payment/retry-order/${order._id}`);
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: 'INR',
        name: 'Buyzo',
        description: 'Complete Payment',
        order_id: data.orderId,
        handler: async (response) => {
          try {
            await API.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              dbOrderId: data.dbOrderId
            });
            fetchOrders();
            try {
              const freshRes = await API.get(`/orders/${data.dbOrderId}`);
              setSelectedOrder(freshRes.data);
            } catch {}
            setPaySuccessPopup({ open: true, orderId: String(data.dbOrderId) });
          } catch {
            toast.error('Payment verified by Razorpay but update failed. Contact support.', { duration: 6000 });
            fetchOrders();
          } finally {
            setRetryPaying(null);
          }
        },
        modal: { ondismiss: () => { toast('Payment cancelled.', { icon: '⏳' }); setRetryPaying(null); } },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#6366F1' }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (response) => {
        toast.error(`Payment failed: ${response.error.description}`, { duration: 5000 });
        setRetryPaying(null);
        try {
          await API.post('/payment/failed', {
            dbOrderId: data.dbOrderId,
            errorDescription: response.error.description,
            errorCode: response.error.code
          });
          fetchOrders();
        } catch {}
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to open payment');
      setRetryPaying(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
          <HiClipboardList className="text-indigo-400" /> My Orders
        </h1>
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-strong rounded-2xl p-6 mb-4 animate-pulse h-32" />
        ))}
      </div>
    );
  }

  if (detailLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-5 w-36 bg-white/10 rounded-xl mb-6 animate-pulse" />
        <div className="glass-strong rounded-3xl p-8 mb-6 animate-pulse h-64" />
      </div>
    );
  }

  // Detail view
  if (selectedOrder) {
    const o = selectedOrder;
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
        <PaymentSuccessPopup
          open={paySuccessPopup.open}
          orderId={paySuccessPopup.orderId}
          onClose={() => {
            setPaySuccessPopup({ open: false, orderId: null });
            setSelectedOrder(null);
            fetchOrders();
          }}
        />

        <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 bg-white/5 px-4 py-2 rounded-xl border border-white/10 transition cursor-pointer text-sm font-semibold">
          <HiArrowLeft /> Back to Orders
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Order #{o._id.slice(-8).toUpperCase()}</h1>
            <p className="text-gray-400 text-sm mt-1">{new Date(o.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className={`badge ${statusColors[o.orderStatus]}`}>{o.orderStatus}</span>
            <button onClick={() => downloadInvoice(o._id)} className="btn-secondary text-sm py-2 px-3.5 flex items-center gap-1.5 rounded-xl">
              <HiDownload /> Download Invoice
            </button>
            {canCancel(o) && (
              <button onClick={() => setCancelModal({ open: true, orderId: o._id })} className="btn-danger text-sm py-2 px-3.5 flex items-center gap-1.5 rounded-xl">
                <HiX /> Cancel
              </button>
            )}
          </div>
        </div>

        {/* Order Timeline */}
        {o.statusHistory?.length > 0 && (
          <div className="glass-strong rounded-3xl p-6 sm:p-8 mb-6 border border-white/10 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-6 tracking-tight">Status Timeline</h2>
            <div className="space-y-0">
              {o.statusHistory.map((h, i) => (
                <div key={i} className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm z-10">{timelineIcons[h.status] || '📋'}</div>
                    {i < o.statusHistory.length - 1 && <div className="w-0.5 h-10 bg-white/10" />}
                  </div>
                  <div className="pb-5">
                    <p className="text-white font-bold text-sm capitalize">{h.status?.replace('_', ' ')}</p>
                    <p className="text-gray-400 text-xs">{new Date(h.timestamp).toLocaleString('en-IN')}</p>
                    {h.note && <p className="text-indigo-300 text-xs mt-1 font-medium">{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="glass-strong rounded-3xl p-6 sm:p-8 mb-6 border border-white/10 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-6 tracking-tight">Purchased Items</h2>
          <div className="space-y-4">
            {o.items.map((it, i) => (
              <div key={i} className="flex gap-4 p-4 glass rounded-2xl cursor-pointer hover:border-indigo-500/40 transition-all border border-white/10 items-center" onClick={() => navigate(`/products/${it.product?._id || it.product}`)}>
                <img src={it.image || it.product?.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60'} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm sm:text-base line-clamp-1">{it.name || it.product?.name}</h3>
                  <p className="text-indigo-400 text-xs font-semibold mt-0.5">{it.product?.category || 'General'}</p>
                  <p className="text-gray-400 text-xs mt-1">Quantity: {it.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-black text-base">₹{(it.price * it.quantity)?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="glass-strong rounded-3xl p-6 border border-white/10 shadow-xl">
            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <HiCreditCard className="text-indigo-400" /> Payment & Billing
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Items Subtotal</span>
                <span className="text-white font-semibold">₹{o.items.reduce((acc, it) => acc + (it.price * it.quantity), 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping Fee</span>
                <span className="text-emerald-400 font-bold">Free</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between text-white font-extrabold text-lg">
                <span>Total Paid</span>
                <span className="gradient-text text-xl">₹{o.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {o.shippingAddress && (
            <div className="glass-strong rounded-3xl p-6 border border-white/10 shadow-xl">
              <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                <HiTruck className="text-purple-400" /> Shipping Address
              </h3>
              {o.shippingAddress.phone && <p className="text-gray-300 text-sm flex items-center gap-1.5"><HiPhone className="text-indigo-400" /> {o.shippingAddress.phone}</p>}
              <p className="text-gray-300 text-sm mt-1">{o.shippingAddress.street}</p>
              <p className="text-gray-400 text-xs mt-0.5">{o.shippingAddress.city}, {o.shippingAddress.state} - {o.shippingAddress.zipCode}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Orders list view
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <PaymentSuccessPopup open={paySuccessPopup.open} orderId={paySuccessPopup.orderId} onClose={() => { setPaySuccessPopup({ open: false, orderId: null }); }} />
      <ConfirmModal open={cancelModal.open} title="Cancel Order" message="Are you sure you want to cancel this order? This action cannot be undone." onConfirm={handleCancel} onCancel={() => setCancelModal({ open: false, orderId: null })} />

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <HiClipboardList className="text-indigo-400" /> My Orders & History
        </h1>
        <p className="text-gray-400 text-sm mt-1">Track current shipments and view previous purchase receipts</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 glass-strong rounded-3xl p-8 border border-white/10">
          <p className="text-gray-300 text-lg font-medium mb-6">You haven't placed any orders yet.</p>
          <Link to="/products" className="btn-primary px-8 py-3.5 no-underline inline-flex items-center gap-2">
            Start Shopping Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o._id} className="glass-strong rounded-3xl p-6 border border-white/10 hover:border-indigo-500/40 transition-all shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-white font-bold text-base">Order #{o._id.slice(-8).toUpperCase()}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{new Date(o.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge ${statusColors[o.orderStatus] || 'bg-gray-500/20 text-gray-400'}`}>{o.orderStatus}</span>
                  <span className="badge bg-white/10 text-white font-bold">₹{o.totalAmount?.toLocaleString()}</span>
                  <span className={`badge text-xs ${paymentStatusColors[o.paymentStatus] || 'bg-gray-500/20 text-gray-400'}`}>
                    {paymentStatusIcons[o.paymentStatus] || '💳'} {o.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 mb-5">
                {o.items.map((it, i) => (
                  <div key={i} onClick={() => navigate(`/products/${it.product?._id || it.product}`)} className="group flex items-center gap-3 glass rounded-xl px-3 py-2 cursor-pointer hover:border-indigo-500/40 transition-all border border-white/10">
                    <img src={it.image || it.product?.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-white text-xs font-bold line-clamp-1 group-hover:text-indigo-300 transition-colors">{it.name || it.product?.name}</p>
                      <p className="text-gray-400 text-[10px]">×{it.quantity} · ₹{it.price?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                <button onClick={() => handleViewDetails(o._id)} className="btn-secondary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 font-semibold">
                  <HiEye /> View Order Details
                </button>
                <button onClick={() => downloadInvoice(o._id)} className="btn-secondary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 font-semibold">
                  <HiDownload /> PDF Invoice
                </button>
                {canCancel(o) && (
                  <button onClick={() => setCancelModal({ open: true, orderId: o._id })} className="btn-danger text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 font-semibold">
                    <HiX /> Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
