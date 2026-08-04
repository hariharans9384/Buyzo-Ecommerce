import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { HiClipboardList, HiRefresh, HiDownload, HiX, HiEye, HiArrowLeft, HiExclamation, HiCurrencyRupee, HiPhone, HiCreditCard, HiBadgeCheck, HiTruck } from 'react-icons/hi';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const statusColors = {
  placed: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-yellow-500/20 text-yellow-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  returned: 'bg-purple-500/20 text-purple-400',
};

const paymentStatusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  paid: 'bg-green-500/20 text-green-400',
  success: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
  refunded: 'bg-purple-500/20 text-purple-400',
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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onCancel}>
      <div style={{ background: 'rgba(26,26,46,0.98)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '380px', margin: '0 16px', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }} className="animate-slideIn" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiExclamation style={{ color: '#ef4444', fontSize: '22px' }} />
          </div>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '18px', margin: 0 }}>{title}</h3>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onConfirm} className="btn-danger" style={{ flex: 1, padding: '10px 0' }}>Yes, Cancel</button>
          <button onClick={onCancel} className="btn-secondary" style={{ flex: 1, padding: '10px 0' }}>No, Keep Order</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Payment success popup
function PaymentSuccessPopup({ open, orderId, onClose }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div style={{ background: 'rgba(26,26,46,0.98)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '400px', margin: '0 16px', textAlign: 'center', position: 'relative' }} className="animate-slideIn">
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #6C63FF, #00D9A6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <HiBadgeCheck style={{ color: '#fff', fontSize: '36px' }} />
        </div>
        <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: '0 0 8px' }}>Payment Successful!</h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 8px' }}>Your order has been confirmed.</p>
        {orderId && <p style={{ color: '#6C63FF', fontSize: '13px', fontWeight: 600, margin: '0 0 24px' }}>Order #{orderId.slice(-8).toUpperCase()}</p>}
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
  const [retryPaying, setRetryPaying] = useState(null); // orderId being retried
  const [paySuccessPopup, setPaySuccessPopup] = useState({ open: false, orderId: null });
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchOrders = () => { API.get('/orders').then(res => setOrders(res.data)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetchOrders(); }, []);

  // Always fetch fresh data when viewing an order (avoids stale list snapshot)
  const handleViewDetails = async (id) => {
    setDetailLoading(true);
    setSelectedOrder(null); // clear previous
    try {
      const res = await API.get(`/orders/${id}`);
      setSelectedOrder(res.data);
    } catch {
      toast.error('Failed to load order details');
      // Fallback to list data
      const fallback = orders.find(o => o._id === id);
      if (fallback) setSelectedOrder(fallback);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancel = async () => {
    const id = cancelModal.orderId;
    setCancelModal({ open: false, orderId: null });
    try { await API.post(`/orders/${id}/cancel`); toast.success('Order cancelled successfully'); fetchOrders(); }
    catch (err) { toast.error(err.response?.data?.message || 'Cancel failed'); }
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
    if (selectedItems.length === 0) { toast.error('Please select at least one item to return'); return; }

    try {
      await API.post(`/orders/${id}/return`, {
        reason: returnReason,
        items: selectedItems.map(i => ({ product: i.product, quantity: i.quantity }))
      });
      toast.success('Return request submitted!');
      setReturningId(null); setReturnReason(''); setReturnItemsForm([]); fetchOrders();
      if (selectedOrder?._id === id) {
        setSelectedOrder({ ...selectedOrder, returnRequest: { requested: true, status: 'pending', reason: returnReason } });
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const downloadInvoice = async (id) => {
    try {
      const res = await API.get(`/orders/${id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `invoice_${id.slice(-8)}.pdf`; a.click();
      window.URL.revokeObjectURL(url); toast.success('Invoice downloaded');
    } catch { toast.error('Failed to download invoice'); }
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
        name: 'Dudez_Shop',
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
            // Refresh orders list
            fetchOrders();
            // Re-fetch the specific order to update detail view with latest data
            try {
              const freshRes = await API.get(`/orders/${data.dbOrderId}`);
              setSelectedOrder(freshRes.data);
            } catch { /* detail update failed, list will still refresh */ }
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
        theme: { color: '#6C63FF' }
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
        } catch { /* silent */ }
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to open payment');
      setRetryPaying(null);
    }
  };

  // Skeleton loader
  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-2"><HiClipboardList className="text-primary" /> My Orders</h1>
      {[1, 2, 3].map(i => (
        <div key={i} className="glass rounded-xl p-5 mb-4 animate-pulse">
          <div className="flex justify-between mb-4"><div className="h-5 w-48 bg-white/10 rounded" /><div className="h-6 w-20 bg-white/10 rounded-full" /></div>
          <div className="flex gap-2 mb-4"><div className="h-12 w-32 bg-white/10 rounded-lg" /><div className="h-12 w-32 bg-white/10 rounded-lg" /></div>
          <div className="flex gap-2"><div className="h-8 w-24 bg-white/10 rounded" /><div className="h-8 w-24 bg-white/10 rounded" /></div>
        </div>
      ))}
    </div>
  );

  // Detail loading skeleton
  if (detailLoading) return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-4 w-32 bg-white/10 rounded mb-6 animate-pulse" />
      <div className="glass rounded-xl p-6 mb-6 animate-pulse">
        <div className="h-6 w-48 bg-white/10 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-16 bg-white/5 rounded-xl" />
          <div className="h-16 bg-white/5 rounded-xl" />
        </div>
      </div>
      <div className="glass rounded-xl p-6 animate-pulse">
        <div className="h-5 w-32 bg-white/10 rounded mb-4" />
        <div className="h-24 bg-white/5 rounded-xl" />
      </div>
    </div>
  );

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
        <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 bg-transparent border-none cursor-pointer text-sm"><HiArrowLeft /> Back to Orders</button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Order #{o._id.slice(-8).toUpperCase()}</h1>
            <p className="text-gray-400 text-sm mt-1">{new Date(o.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge ${statusColors[o.orderStatus]}`}>{o.orderStatus}</span>
            <button onClick={() => downloadInvoice(o._id)} className="btn-secondary text-sm py-2 px-3 flex items-center gap-1"><HiDownload /> Invoice</button>
            {canCancel(o) && <button onClick={() => setCancelModal({ open: true, orderId: o._id })} className="btn-danger text-sm py-2 px-3 flex items-center gap-1"><HiX /> Cancel</button>}
          </div>
        </div>

        {/* Order Timeline */}
        {o.statusHistory?.length > 0 && (
          <div className="glass rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Order Timeline</h2>
            <div className="space-y-0">
              {o.statusHistory.map((h, i) => (
                <div key={i} className="flex gap-3 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm z-10">{timelineIcons[h.status] || '📋'}</div>
                    {i < o.statusHistory.length - 1 && <div className="w-0.5 h-8 bg-white/10" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-white font-medium text-sm capitalize">{h.status?.replace('_', ' ')}</p>
                    <p className="text-gray-500 text-xs">{new Date(h.timestamp).toLocaleString('en-IN')}</p>
                    {h.note && <p className="text-gray-400 text-xs mt-0.5">{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="glass rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Items</h2>
          <div className="space-y-4">
            {o.items.map((it, i) => (
              <div key={i} className="flex gap-4 p-3 glass rounded-xl cursor-pointer hover:border-primary/30 transition-all" onClick={() => navigate(`/products/${it.product?._id || it.product}`)}>
                <img src={it.image || it.product?.image} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{it.name || it.product?.name}</h3>
                  <p className="text-primary text-xs mt-0.5">{it.product?.category || 'Product'}</p>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{it.product?.description?.slice(0, 100)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-bold">₹{it.price?.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs mt-1">Qty: {it.quantity}</p>
                  {it.returnedQuantity > 0 && <p className="text-warning text-[10px] mt-0.5 hidden xs:block">Returned: {it.returnedQuantity}</p>}
                  <p className="text-primary font-semibold text-sm mt-1">₹{(it.price * it.quantity)?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Complete Payment banner for pending online orders */}
        {canRetryPayment(o) && (
          <div className="glass rounded-xl p-5 mb-6 animate-fadeIn" style={{ borderColor: 'rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.05)' }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-yellow-400 font-semibold flex items-center gap-2">⏳ Payment Pending</p>
                <p className="text-gray-400 text-sm mt-1">Your order is saved but payment was not completed.</p>
              </div>
              <button
                onClick={() => handleRetryPayment(o)}
                disabled={retryPaying === o._id}
                className="btn-accent flex items-center gap-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6C63FF, #00D9A6)' }}
              >
                <HiCreditCard />
                {retryPaying === o._id ? 'Opening...' : `Complete Payment — ₹${o.totalAmount?.toLocaleString()}`}
              </button>
            </div>
          </div>
        )}

        {/* Summary + Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="glass rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Payment</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>₹{o.items.reduce((acc, it) => acc + (it.price * it.quantity), 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-300"><span>Shipping</span><span className="text-success">Free</span></div>
              {o.paymentMethod === 'cod' && (
                <div className="flex justify-between text-amber-500"><span>COD Fee</span><span>₹{(o.codFee || 25).toLocaleString()}</span></div>
              )}
              {o.paymentMethod === 'online' && (
                <div className="flex justify-between text-gray-400"><span>Online Handling</span><span>₹0</span></div>
              )}
              <div className="border-t border-white/10 pt-2 flex justify-between text-white font-bold text-lg"><span>Total</span><span>₹{o.totalAmount?.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-400 text-xs">
                <span>Payment Status</span>
                <span className={`font-semibold flex items-center gap-1 ${o.paymentStatus === 'paid' ? 'text-green-400' :
                    o.paymentStatus === 'failed' ? 'text-red-400' :
                      o.paymentStatus === 'refunded' ? 'text-purple-400' :
                        'text-yellow-400'
                  }`}>
                  {paymentStatusIcons[o.paymentStatus] || '💳'}
                  {o.paymentMethod?.toUpperCase()} — {o.paymentStatus === 'paid' ? 'Paid' : o.paymentStatus === 'failed' ? 'Payment Failed' : o.paymentStatus === 'refunded' ? 'Refunded' : 'Payment Pending'}
                </span>
              </div>
            </div>
          </div>
          {o.shippingAddress && (
            <div className="glass rounded-xl p-5">
              <h3 className="text-white font-semibold mb-3">Shipping Address</h3>
              {o.shippingAddress.phone && <p className="text-gray-300 text-sm flex items-center gap-1"><HiPhone className="text-primary text-sm" /> {o.shippingAddress.phone}</p>}
              <p className="text-gray-300 text-sm">{o.shippingAddress.street}</p>
              <p className="text-gray-300 text-sm">{o.shippingAddress.city}, {o.shippingAddress.state} - {o.shippingAddress.zipCode}</p>
              <p className="text-gray-300 text-sm">{o.shippingAddress.country}</p>
            </div>
          )}
        </div>

        {/* Delivery & Tracking Box — shown once AWB is assigned by admin */}
        {o.awbCode && (
          <div className="glass rounded-xl p-5 mb-6 animate-fadeIn" style={{ borderLeft: '4px solid #3B82F6', borderColor: 'rgba(59,130,246,0.35)' }}>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><HiTruck className="text-blue-400" /> Delivery & Tracking</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Courier Partner</p>
                <p className="text-white font-semibold">{o.courierName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Tracking ID (AWB)</p>
                <p className="text-accent font-bold text-lg tracking-widest">{o.awbCode}</p>
              </div>
              <div className="sm:text-right">
                <a
                  href={o.trackingUrl || `https://shiprocket.co/tracking/${o.awbCode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-6"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}
                >
                  <HiTruck /> Track Live Status
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Refund details */}
        {orderHasRefunds(o) && (
          <div className="glass rounded-xl p-5 mb-6" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><HiCurrencyRupee className="text-warning" /> Refund Details</h3>

            {/* List returned items */}
            {o.items.some(it => it.returnedQuantity > 0) && (
              <div className="mb-4 bg-white/5 rounded-lg p-3">
                <p className="text-gray-400 text-xs uppercase font-medium tracking-wider mb-2">Returned Items</p>
                <div className="space-y-2">
                  {o.items.filter(it => it.returnedQuantity > 0).map((it, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 line-clamp-1">{it.name || it.product?.name}</span>
                        <span className="text-gray-500 text-xs">×{it.returnedQuantity}</span>
                      </div>
                      <span className="text-white font-medium">₹{(it.price * it.returnedQuantity)?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-400">Total Refund:</span> <span className="text-warning font-bold pl-1">₹{o.refund.amount?.toLocaleString()}</span></div>
              <div><span className="text-gray-400">Status:</span> <span className={`font-medium pl-1 ${o.refund.status === 'completed' ? 'text-success' : 'text-warning'}`}>{o.refund.status}</span></div>
              {o.refund.reason && <div className="col-span-2"><span className="text-gray-400">Latest Note:</span> <span className="text-gray-300 pl-1">{o.refund.reason}</span></div>}
              {o.refund.refundedAt && <div className="col-span-2"><span className="text-gray-400">Last Update:</span> <span className="text-gray-300 pl-1">{new Date(o.refund.refundedAt).toLocaleDateString('en-IN')}</span></div>}
            </div>
          </div>
        )}

        {canReturn(o) && (
          <div className="space-y-3">
            {!returningId ? (
              <button onClick={() => startReturn(o)} className="btn-secondary flex items-center gap-1"><HiRefresh /> Request Return</button>
            ) : (
              <div className="glass rounded-lg p-5 space-y-4 animate-fadeIn" style={{ borderColor: 'rgba(108,99,255,0.4)' }}>
                <h3 className="text-white font-semibold">Select Items to Return</h3>
                <div className="space-y-2">
                  {returnItemsForm.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                      <input type="checkbox" checked={item.selected} onChange={e => {
                        const newArr = [...returnItemsForm];
                        newArr[idx].selected = e.target.checked;
                        setReturnItemsForm(newArr);
                      }} className="w-4 h-4 rounded border-white/20 bg-transparent text-primary focus:ring-primary focus:ring-offset-0" />
                      <div className="flex-1">
                        <p className="text-white text-sm line-clamp-1">{item.name}</p>
                        <p className="text-gray-400 text-xs text-primary">₹{(item.price * item.quantity)?.toLocaleString()}</p>
                      </div>
                      {item.selected && item.max > 1 && (
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-400">Qty:</label>
                          <select value={item.quantity} onChange={e => {
                            const newArr = [...returnItemsForm];
                            newArr[idx].quantity = Number(e.target.value);
                            setReturnItemsForm(newArr);
                          }} className="input-field py-1 px-2 text-xs w-16">
                            {[...Array(item.max)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                          </select>
                        </div>
                      )}
                      {(!item.selected || item.max === 1) && (
                        <span className="text-xs text-gray-500">Qty: {item.max} available</span>
                      )}
                    </div>
                  ))}
                </div>
                <textarea value={returnReason} onChange={e => setReturnReason(e.target.value)} className="input-field text-sm w-full" rows="2" placeholder="Reason for return..." />
                <div className="flex gap-2 pt-2">
                  <button onClick={() => handleReturn(o._id)} className="btn-primary text-sm py-2 px-6">Submit Return</button>
                  <button onClick={() => { setReturningId(null); setReturnReason(''); setReturnItemsForm([]); }} className="btn-secondary text-sm py-2 px-6">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {o.returnRequest?.status === 'pending' && (
          <div className="glass rounded-lg p-4 mt-4" style={{ borderColor: 'rgba(108,99,255,0.3)' }}>
            <p className="text-sm text-gray-300 flex items-center gap-1"><HiRefresh className="text-primary" /> Return Request Pending</p>
            {o.returnRequest.items && o.returnRequest.items.length > 0 && (
              <p className="text-gray-400 text-xs mt-1">For {o.returnRequest.items.reduce((acc, it) => acc + it.quantity, 0)} item(s)</p>
            )}
            <p className="text-gray-500 text-xs mt-1 italic">Reason: {o.returnRequest.reason}</p>
          </div>
        )}
      </div>
    );
  }

  // Orders list
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <PaymentSuccessPopup open={paySuccessPopup.open} orderId={paySuccessPopup.orderId} onClose={() => { setPaySuccessPopup({ open: false, orderId: null }); }} />
      <ConfirmModal open={cancelModal.open} title="Cancel Order" message="Are you sure you want to cancel this order? This action cannot be undone." onConfirm={handleCancel} onCancel={() => setCancelModal({ open: false, orderId: null })} />
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-2"><HiClipboardList className="text-primary" /> My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-4">You haven't placed any orders yet.</p>
          <Link to="/products" className="btn-primary px-8 py-3 no-underline">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o._id} className="glass rounded-xl p-5 hover:border-primary/20 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-white font-medium">Order #{o._id.slice(-8).toUpperCase()}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{new Date(o.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge ${statusColors[o.orderStatus] || 'bg-gray-500/20 text-gray-400'}`}>{o.orderStatus}</span>
                  <span className="badge bg-white/5 text-white">₹{o.totalAmount?.toLocaleString()}</span>
                  {/* Payment status badge */}
                  <span className={`badge text-xs ${paymentStatusColors[o.paymentStatus] || 'bg-gray-500/20 text-gray-400'}`}>
                    {paymentStatusIcons[o.paymentStatus] || '💳'} {o.paymentStatus === 'paid' ? 'Paid' : o.paymentStatus === 'failed' ? 'Payment Failed' : o.paymentStatus === 'refunded' ? 'Refunded' : 'Payment Pending'}
                  </span>
                  {o.refund?.status && o.refund.status !== 'none' && (
                    <span className="badge bg-amber-500/20 text-amber-400 text-xs">Refund: {o.refund.status}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {o.items.map((it, i) => (
                  <div key={i} onClick={() => navigate(`/products/${it.product?._id || it.product}`)} className="group flex items-center gap-2 glass rounded-lg px-3 py-1.5 cursor-pointer hover:border-primary/40 transition-all">
                    <img src={it.image || it.product?.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-white text-xs line-clamp-1 group-hover:text-primary transition-colors">{it.name || it.product?.name}</p>
                      <p className="text-gray-400 text-xs">×{it.quantity} · ₹{it.price?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {o.returnRequest?.requested && (
                <div className="glass rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-300 flex items-center gap-1"><HiRefresh className="text-primary" /> Return: <span className={`font-medium ${o.returnRequest.status === 'approved' ? 'text-success' : o.returnRequest.status === 'rejected' ? 'text-error' : 'text-warning'}`}>{o.returnRequest.status}</span></p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => handleViewDetails(o._id)} className="btn-secondary text-sm py-2 px-3 flex items-center gap-1"><HiEye /> View Details</button>
                <button onClick={() => downloadInvoice(o._id)} className="btn-secondary text-sm py-2 px-3 flex items-center gap-1"><HiDownload /> Invoice</button>
                {canRetryPayment(o) && (
                  <button
                    onClick={() => handleRetryPayment(o)}
                    disabled={retryPaying === o._id}
                    className="btn-accent text-sm py-2 px-3 flex items-center gap-2 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #6C63FF, #00D9A6)' }}
                  >
                    <HiCreditCard /> {retryPaying === o._id ? 'Opening...' : 'Complete Payment'}
                  </button>
                )}
                {canCancel(o) && <button onClick={() => setCancelModal({ open: true, orderId: o._id })} className="btn-danger text-sm py-1.5 px-3 flex items-center gap-1"><HiX /> Cancel</button>}
                {canReturn(o) && <button onClick={() => startReturn(o)} className="btn-secondary text-sm py-2 px-3 flex items-center gap-1"><HiRefresh /> Return</button>}
                {o.orderStatus === 'shipped' && <span className="text-gray-500 text-xs italic">Cannot cancel — shipped</span>}
                {o.orderStatus === 'delivered' && !canReturn(o) && !o.returnRequest?.requested && <span className="text-gray-500 text-xs italic">Return window expired</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
