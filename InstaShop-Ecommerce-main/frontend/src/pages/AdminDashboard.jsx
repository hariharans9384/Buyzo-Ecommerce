import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HiCurrencyRupee, HiShoppingBag, HiUsers, HiClipboardList, HiPencil, HiTrash, HiPlus, HiCheck, HiX, HiRefresh, HiEye, HiArrowLeft, HiTrendingUp, HiExclamation, HiMail, HiTag, HiPhotograph, HiSearch, HiTruck } from 'react-icons/hi';
import API from '../utils/api';
import toast from 'react-hot-toast';

// Confirmation Modal — rendered via Portal at document.body
function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmText = 'Yes, Confirm', cancelText = 'Cancel' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onCancel}>
      <div style={{ background: 'rgba(26,26,46,0.98)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '380px', margin: '0 16px', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
        className="animate-slideIn" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(108,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiExclamation style={{ color: '#6C63FF', fontSize: '22px' }} />
          </div>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '18px', margin: 0 }}>{title}</h3>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onConfirm} className="btn-primary" style={{ flex: 1, padding: '10px 0' }}>{confirmText}</button>
          <button onClick={onCancel} className="btn-secondary" style={{ flex: 1, padding: '10px 0' }}>{cancelText}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Search Box Component
function SearchBox({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative flex-1 max-w-sm">
      <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10 py-2 text-sm w-full"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white bg-transparent border-none cursor-pointer">
          <HiX className="text-sm" />
        </button>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [productFormData, setProductFormData] = useState({ name: '', description: '', price: '', originalPrice: '', category: '', stock: '', featured: false });
  const [keepExistingImages, setKeepExistingImages] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusConfirm, setStatusConfirm] = useState({ open: false, orderId: null, newStatus: '' });
  const [contacts, setContacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editCategory, setEditCategory] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [manualAwb, setManualAwb] = useState('');
  const [manualCourier, setManualCourier] = useState('');
  const [manualTrackingUrl, setManualTrackingUrl] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, prodRes, ordRes, contRes, catRes, notifRes] = await Promise.all([
        API.get('/admin/dashboard'), API.get('/products?limit=100'), API.get('/admin/orders'),
        API.get('/contact').catch(() => ({ data: [] })),
        API.get('/categories').catch(() => ({ data: [] })),
        API.get('/notifications').catch(() => ({ data: [] }))
      ]);
      setStats(dashRes.data); setProducts(prodRes.data.products); setOrders(ordRes.data);
      setContacts(contRes.data); setCategories(catRes.data); setNotifications(notifRes.data);
    } catch (err) { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
    } catch (err) { console.error('Failed to mark as read'); }
  };

  useEffect(() => {
    if (selectedOrder) {
      setManualAwb(selectedOrder.awbCode || '');
      setManualCourier(selectedOrder.courierName || '');
      setManualTrackingUrl(selectedOrder.trackingUrl || '');
    }
  }, [selectedOrder]);

  const handleUpdateTracking = async () => {
    const tid = toast.loading('Updating tracking info...');
    try {
      const res = await API.put(`/admin/orders/${selectedOrder._id}`, {
        awbCode: manualAwb,
        courierName: manualCourier,
        trackingUrl: manualTrackingUrl,
        orderStatus: selectedOrder.orderStatus === 'placed' ? 'shipped' : selectedOrder.orderStatus
      });
      setSelectedOrder(res.data);
      toast.success('Tracking info updated!', { id: tid });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update tracking', { id: tid });
    }
  };

  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (err) { toast.error('Delete failed'); }
  };

  const handleProductSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('name', productFormData.name);
      formData.append('description', productFormData.description);
      formData.append('price', productFormData.price);
      if (productFormData.originalPrice) formData.append('originalPrice', productFormData.originalPrice);
      formData.append('category', productFormData.category);
      formData.append('stock', productFormData.stock);
      formData.append('featured', productFormData.featured);
      productImages.forEach(file => formData.append('images', file));

      if (productFormData._id) {
        formData.append('keepExistingImages', keepExistingImages);
        await API.put(`/products/${productFormData._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated!');
      } else {
        await API.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product added!');
      }

      setProductFormOpen(false);
      setProductFormData({ name: '', description: '', price: '', originalPrice: '', category: '', stock: '', featured: false });
      setProductImages([]); setImagePreviews([]);
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save product'); }
  };

  const openProductForm = (product = null) => {
    if (product) {
      setProductFormData({ ...product });
      setKeepExistingImages(true);
    } else {
      setProductFormData({ name: '', description: '', price: '', originalPrice: '', category: '', stock: '', featured: false });
      setKeepExistingImages(true);
    }
    setProductImages([]);
    setImagePreviews([]);
    setProductFormOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await API.delete(`/products/${id}`); toast.success('Deleted!'); loadData(); }
    catch (err) { toast.error('Delete failed'); }
  };

  const handleReturnAction = async (orderId, action) => {
    try {
      await API.put(`/admin/orders/${orderId}/return`, { action });
      toast.success(`Return ${action}d`); loadData(); setSelectedOrder(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const confirmStatusUpdate = () => {
    const { orderId, newStatus } = statusConfirm;
    setStatusConfirm({ open: false, orderId: null, newStatus: '' });
    API.put(`/admin/orders/${orderId}`, { orderStatus: newStatus })
      .then(() => { toast.success(`Order updated to "${newStatus}" — email sent`); loadData(); })
      .catch(() => toast.error('Failed'));
  };

  const requestStatusChange = (orderId, newStatus) => {
    setStatusConfirm({ open: true, orderId, newStatus });
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: HiCurrencyRupee },
    { id: 'products', label: 'Products', icon: HiShoppingBag },
    { id: 'orders', label: 'Orders', icon: HiClipboardList, badge: stats?.pendingReturns || 0 },
    { id: 'categories', label: 'Categories', icon: HiTag },
    { id: 'contacts', label: 'Messages', icon: HiMail },
    { id: 'notifications', label: 'Alerts', icon: HiExclamation, badge: notifications.filter(n => !n.isRead).length },
  ];

  // Admin Order Detail View
  if (selectedOrder) {
    const order = selectedOrder;
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
        <ConfirmModal open={statusConfirm.open} title="Update Order Status" message={`Are you sure you want to change this order status to "${statusConfirm.newStatus}"? An email will be sent to the customer.`}
          onConfirm={confirmStatusUpdate} onCancel={() => setStatusConfirm({ open: false, orderId: null, newStatus: '' })} confirmText="Yes, Update" />

        <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 bg-transparent border-none cursor-pointer text-sm"><HiArrowLeft /> Back</button>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Order #{order._id.slice(-8).toUpperCase()}</h1>
            <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
          </div>
          <select value={order.orderStatus} onChange={e => requestStatusChange(order._id, e.target.value)}
            className="input-field py-2 w-auto cursor-pointer" style={{ minWidth: '140px' }}>
            {['placed', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="glass rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Customer</h3>
            <p className="text-gray-300 text-sm">{order.user?.name}</p>
            <p className="text-gray-400 text-sm">{order.user?.email}</p>
            {order.user?.phone && <p className="text-gray-400 text-sm">{order.user?.phone}</p>}
          </div>
          {order.shippingAddress && (
            <div className="glass rounded-xl p-5">
              <h3 className="text-white font-semibold mb-3">Shipping Address</h3>
              <p className="text-gray-300 text-sm">{order.shippingAddress.street}</p>
              <p className="text-gray-300 text-sm">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">Order Items</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-gray-400 text-left border-b border-white/10"><th className="pb-3">Product</th><th className="pb-3 text-center">Qty</th><th className="pb-3 text-right">Price</th><th className="pb-3 text-right">Total</th></tr></thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-3"><div className="flex items-center gap-3"><img src={item.image || item.product?.image} alt="" className="w-12 h-12 rounded-lg object-cover" /><div><p className="text-white font-medium">{item.name || item.product?.name}</p><p className="text-gray-500 text-xs">{item.product?.category}</p></div></div></td>
                  <td className="py-3 text-center text-gray-300">{item.quantity}</td>
                  <td className="py-3 text-right text-gray-300">₹{item.price?.toLocaleString()}</td>
                  <td className="py-3 text-right text-white font-medium">₹{(item.price * item.quantity)?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-white/10 pt-4 mt-2 text-right space-y-1">
            <p className="text-gray-400 text-sm">Subtotal: ₹{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</p>
            {order.paymentMethod === 'cod' && (
              <p className="text-amber-500 text-sm font-medium">COD Fee: ₹{(order.codFee || 25).toLocaleString()}</p>
            )}
            <p className="text-white text-xl font-bold pt-1">Total: ₹{order.totalAmount?.toLocaleString()}</p>
            <p className="text-gray-500 text-xs mt-1">Payment: {order.paymentMethod?.toUpperCase()} ({order.paymentStatus})</p>
          </div>
        </div>

        {/* Shiprocket Logistics Panel */}
        <div className="glass rounded-xl p-6 mb-6" style={{ borderColor: 'rgba(59,130,246,0.3)' }}>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><HiTruck className="text-blue-400" /> Logistics & Shipping (Shiprocket)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-1">SR Order ID</p><p className="text-white text-sm font-medium">{order.shiprocketOrderId || '—'}</p></div>
            <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Shipment ID</p><p className="text-white text-sm font-medium">{order.shiprocketShipmentId || '—'}</p></div>
            <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-1">AWB Code</p><p className="text-accent text-sm font-bold">{order.awbCode || 'Pending'}</p></div>
            <div><p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Courier</p><p className="text-white text-sm">{order.courierName || 'Pending'}</p></div>
          </div>
          <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
            {!order.awbCode && order.shiprocketShipmentId && (
              <button onClick={async () => {
                const tid = toast.loading('Assigning AWB...');
                try { const r = await API.post(`/admin/orders/${order._id}/shiprocket/awb`); setSelectedOrder(r.data); toast.success('AWB Assigned! Order marked Shipped.', { id: tid }); loadData(); }
                catch (e) { toast.error(e.response?.data?.message || 'AWB Failed', { id: tid }); }
              }} className="btn-primary text-xs py-2 px-4">🏷 Assign AWB</button>
            )}
            {!order.awbCode && !order.shiprocketShipmentId && (
              <p className="text-gray-500 text-xs italic">⚠ Order not yet pushed to Shiprocket. Place a new order to trigger auto-push.</p>
            )}
            {order.awbCode && (
              <button onClick={async () => {
                const tid = toast.loading('Generating Pickup...');
                try { await API.post(`/admin/orders/${order._id}/shiprocket/pickup`); toast.success('Pickup scheduled!', { id: tid }); }
                catch (e) { toast.error(e.response?.data?.message || 'Pickup Failed', { id: tid }); }
              }} className="btn-accent text-xs py-2 px-4">🚚 Generate Pickup</button>
            )}
            {order.awbCode && !order.manifestUrl && (
              <button onClick={async () => {
                const tid = toast.loading('Generating Manifest...');
                try { const r = await API.post(`/admin/orders/${order._id}/shiprocket/manifest`); setSelectedOrder(r.data); toast.success('Manifest ready!', { id: tid }); loadData(); }
                catch (e) { toast.error('Manifest Failed', { id: tid }); }
              }} className="btn-secondary text-xs py-2 px-4">📋 Gen Manifest</button>
            )}
            {order.manifestUrl && (<a href={order.manifestUrl} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-2 px-4 no-underline text-white">📋 Print Manifest</a>)}
            {order.awbCode && !order.labelUrl && (
              <button onClick={async () => {
                const tid = toast.loading('Generating Label...');
                try { const r = await API.post(`/admin/orders/${order._id}/shiprocket/label`); setSelectedOrder(r.data); toast.success('Label ready!', { id: tid }); loadData(); }
                catch (e) { toast.error('Label Failed', { id: tid }); }
              }} className="btn-secondary text-xs py-2 px-4">🏷 Gen Label</button>
            )}
            {order.labelUrl && (<a href={order.labelUrl} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-2 px-4 no-underline text-white">🏷 Print Label</a>)}
            {order.shiprocketOrderId && !order.invoiceUrl && (
              <button onClick={async () => {
                const tid = toast.loading('Generating Invoice...');
                try { const r = await API.post(`/admin/orders/${order._id}/shiprocket/invoice`); setSelectedOrder(r.data); toast.success('Invoice ready!', { id: tid }); loadData(); }
                catch (e) { toast.error('Invoice Failed', { id: tid }); }
              }} className="btn-secondary text-xs py-2 px-4">📄 Gen Invoice</button>
            )}
            {order.invoiceUrl && (<a href={order.invoiceUrl} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-2 px-4 no-underline text-white">📄 Print Invoice</a>)}
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-gray-300 text-sm font-medium mb-4 flex items-center gap-2">🛠 Manual Tracking Override</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-gray-500 text-xs block mb-1 uppercase tracking-wider">Tracking ID / AWB</label>
                <input type="text" value={manualAwb} onChange={e => setManualAwb(e.target.value)} className="input-field py-2 text-xs w-full" placeholder="e.g. 190411906..." />
              </div>
              <div>
                <label className="text-gray-500 text-xs block mb-1 uppercase tracking-wider">Courier Partner</label>
                <input type="text" value={manualCourier} onChange={e => setManualCourier(e.target.value)} className="input-field py-2 text-xs w-full" placeholder="e.g. Delhivery, Bluedart" />
              </div>
              <div>
                <label className="text-gray-500 text-xs block mb-1 uppercase tracking-wider">Tracking Link</label>
                <input type="text" value={manualTrackingUrl} onChange={e => setManualTrackingUrl(e.target.value)} className="input-field py-2 text-xs w-full" placeholder="https://tracking-xyz.com/..." />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleUpdateTracking} 
                className="btn-primary text-xs py-2 px-6 flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                <HiCheck className="text-sm" /> Save Tracking Info
              </button>
            </div>
          </div>
        </div>

        {order.returnRequest?.status === 'pending' && (
          <div className="glass rounded-xl p-5 mb-6" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
            <p className="text-warning font-medium flex items-center gap-1 mb-2"><HiRefresh /> Return Requested</p>
            <p className="text-gray-400 text-sm mb-3">Reason: {order.returnRequest.reason}</p>

            {order.returnRequest.items && order.returnRequest.items.length > 0 && (
              <div className="mb-4">
                <p className="text-white text-sm font-semibold mb-2">Items to Return:</p>
                <div className="space-y-2">
                  {order.returnRequest.items.map((rItem, i) => {
                    const originalItem = order.items.find(oi => oi.product?._id?.toString() === rItem.product?.toString() || oi.product?.toString() === rItem.product?.toString());
                    return (
                      <div key={i} className="flex justify-between items-center bg-white/5 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <img src={originalItem?.image || originalItem?.product?.image} className="w-8 h-8 rounded object-cover" alt="" />
                          <span className="text-gray-300 text-sm">{originalItem?.name || originalItem?.product?.name || 'Product'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-400 text-xs">Qty: {rItem.quantity}</span>
                          <p className="text-white text-sm font-medium">₹{(rItem.quantity * rItem.price)?.toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-warning font-semibold text-right mt-2 text-sm">
                  Est. Refund: ₹{order.returnRequest.items.reduce((sum, it) => sum + (it.price * it.quantity), 0).toLocaleString()}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => handleReturnAction(order._id, 'approve')} className="btn-accent text-sm py-2 px-4">Approve Return</button>
              <button onClick={() => handleReturnAction(order._id, 'reject')} className="btn-danger text-sm py-2 px-4">Reject</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <ConfirmModal open={statusConfirm.open} title="Update Order Status" message={`Change status to "${statusConfirm.newStatus}"? Customer will be notified via email.`}
        onConfirm={confirmStatusUpdate} onCancel={() => setStatusConfirm({ open: false, orderId: null, newStatus: '' })} confirmText="Yes, Update" />

      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setSearchQuery(''); setOrderFilter('all'); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all border-none cursor-pointer whitespace-nowrap relative ${tab === t.id ? 'bg-primary text-white' : 'glass text-gray-300 hover:text-white'}`}>
            <t.icon /> {t.label}
            {t.badge > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-[10px] flex items-center justify-center rounded-full border-2 border-[#1a1a2e]">{t.badge}</span>}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Revenue', value: `₹${stats.totalRevenue?.toLocaleString()}`, icon: HiCurrencyRupee, color: '#6C63FF' },
              { label: 'Orders', value: stats.totalOrders, icon: HiClipboardList, color: '#FF6584' },
              { label: 'Products', value: stats.totalProducts, icon: HiShoppingBag, color: '#00D9A6' },
              { label: 'Customers', value: stats.totalUsers, icon: HiUsers, color: '#F59E0B' },
            ].map((s, i) => (
              <div key={i} className="glass rounded-xl p-5">
                <s.icon className="text-2xl mb-3" style={{ color: s.color }} />
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-gray-400 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          {/* Refund stats */}
          {(stats.pendingRefunds > 0 || stats.totalRefundAmount > 0) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-xl p-5" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
                <p className="text-warning text-sm font-medium mb-1">Pending Refunds</p>
                <p className="text-2xl font-bold text-white">{stats.pendingRefunds || 0}</p>
              </div>
              <div className="glass rounded-xl p-5" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
                <p className="text-warning text-sm font-medium mb-1">Total Refund Amount</p>
                <p className="text-2xl font-bold text-white">₹{stats.totalRefundAmount?.toLocaleString() || 0}</p>
              </div>
            </div>
          )}
          {stats.topProducts?.length > 0 && (
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><HiTrendingUp className="text-accent" /> Top Selling</h3>
              {stats.topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3 py-2">
                  <span className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1"><p className="text-white text-sm">{p.name}</p></div>
                  <span className="text-accent font-bold text-sm">{p.totalSold || 0} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Products */}
      {tab === 'products' && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4 flex-1 w-full">
              <p className="text-gray-400 whitespace-nowrap">{products.length} products</p>
              <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Search product name or category..." />
            </div>
            <button onClick={() => openProductForm()} className="btn-primary flex items-center gap-1 whitespace-nowrap"><HiPlus /> Add Product</button>
          </div>
          {productFormOpen && (
            <div className="glass-strong rounded-xl p-6 mb-6 animate-fadeIn">
              <h3 className="text-white font-semibold mb-4">{productFormData._id ? 'Edit Product' : 'Add New Product'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={productFormData.name} onChange={e => setProductFormData({ ...productFormData, name: e.target.value })} className="input-field" placeholder="Name" />
                <select value={productFormData.category} onChange={e => setProductFormData({ ...productFormData, category: e.target.value })} className="admin-select" style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', width: '100%' }}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
                <input value={productFormData.price} onChange={e => setProductFormData({ ...productFormData, price: e.target.value })} className="input-field" placeholder="Price" type="number" />
                <input value={productFormData.originalPrice} onChange={e => setProductFormData({ ...productFormData, originalPrice: e.target.value })} className="input-field" placeholder="Original Price" type="number" />
                <input value={productFormData.stock} onChange={e => setProductFormData({ ...productFormData, stock: e.target.value })} className="input-field" placeholder="Stock" type="number" />

                <div className="flex items-center gap-2 pl-2">
                  <input type="checkbox" id="featured" checked={Boolean(productFormData.featured)} onChange={e => setProductFormData({ ...productFormData, featured: e.target.checked })} className="cursor-pointer" />
                  <label htmlFor="featured" className="text-sm text-gray-300 cursor-pointer">Featured Product</label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-300 mb-2 flex flex-col gap-1">
                    <span className="flex items-center gap-2"><HiPhotograph /> Product Images (multiple)</span>
                    {productFormData._id && <span className="text-xs text-warning">Uploading new images will append to existing ones by default.</span>}
                  </label>
                  <input type="file" multiple accept="image/*" onChange={e => {
                    const files = Array.from(e.target.files);
                    setProductImages(files);
                    setImagePreviews(files.map(f => URL.createObjectURL(f)));
                  }} className="input-field text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary file:font-medium file:cursor-pointer mb-2" />

                  {productFormData._id && (
                    <label className="flex items-center gap-2 text-sm text-gray-400 mt-2 mb-2 cursor-pointer">
                      <input type="checkbox" checked={keepExistingImages} onChange={e => setKeepExistingImages(e.target.checked)} className="cursor-pointer" />
                      Keep existing images when uploading new ones
                    </label>
                  )}

                  {(imagePreviews.length > 0 || (productFormData._id && productFormData.images?.length > 0)) && (
                    <div className="flex gap-2 mt-3 flex-wrap p-3 glass rounded-xl border border-white/5">
                      {/* Show existing images if editing and not replacing all */}
                      {productFormData._id && keepExistingImages && productFormData.images?.map((src, i) => (
                        <div key={`old-${i}`} className="relative group">
                          <img src={src} alt="" className="w-16 h-16 rounded-lg object-cover border border-white/10 opacity-60" />
                          <span className="absolute bottom-0 right-0 bg-black/70 text-[10px] text-white px-1 rounded-tl-md">Old</span>
                        </div>
                      ))}
                      {/* Show newly selected previews */}
                      {imagePreviews.map((src, i) => (
                        <img key={`new-${i}`} src={src} alt="" className="w-16 h-16 rounded-lg object-cover border-2 border-primary" />
                      ))}
                    </div>
                  )}
                </div>
                <textarea value={productFormData.description} onChange={e => setProductFormData({ ...productFormData, description: e.target.value })} className="input-field sm:col-span-2" placeholder="Description" rows="3" />
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={handleProductSubmit} className="btn-accent px-6">Save Product</button>
                <button onClick={() => { setProductFormOpen(false); setProductImages([]); setImagePreviews([]); }} className="btn-secondary px-6">Cancel</button>
              </div>
            </div>
          )}
          <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-gray-400 text-left border-b border-white/10"><th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4">Sold</th><th className="p-4">Actions</th></tr></thead>
                <tbody>
                  {products.filter(p =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.category.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map(p => (
                    <tr key={p._id} className="border-b border-white/5 hover:bg-white/3 transition">
                      <td className="p-4"><div className="flex items-center gap-3"><img src={p.images?.[0] || p.image || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-cover" />{p.images?.length > 1 && <span className="badge bg-white/10 text-gray-400 text-xs">+{p.images.length - 1}</span>}<span className="text-white">{p.name}</span></div></td>
                      <td className="p-4 text-gray-300">{p.category}</td>
                      <td className="p-4"><span className="text-white">₹{p.price?.toLocaleString()}</span> {p.originalPrice && <span className="text-gray-500 text-xs line-through ml-1">₹{p.originalPrice}</span>}</td>
                      <td className="p-4"><span className={p.stock > 10 ? 'text-success' : p.stock > 0 ? 'text-warning' : 'text-error'}>{p.stock}</span></td>
                      <td className="p-4"><span className="text-accent font-semibold">{p.totalSold || 0}</span></td>
                      <td className="p-4"><div className="flex gap-1"><button onClick={() => openProductForm(p)} className="p-1.5 text-primary hover:bg-primary/10 rounded bg-transparent border-none cursor-pointer"><HiPencil /></button><button onClick={() => handleDeleteProduct(p._id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded bg-transparent border-none cursor-pointer"><HiTrash /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-4">
              <p className="text-gray-400 text-sm whitespace-nowrap">
                Filtered: {orders.filter(order => {
                  const mSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

                  let mFilter = true;
                  if (orderFilter === 'placed') mFilter = order.orderStatus === 'placed';
                  else if (orderFilter === 'shipped') mFilter = order.orderStatus === 'shipped';
                  else if (orderFilter === 'delivered') mFilter = order.orderStatus === 'delivered';
                  else if (orderFilter === 'cancelled') mFilter = order.orderStatus === 'cancelled';
                  else if (orderFilter === 'payment_pending') mFilter = order.paymentStatus === 'pending';
                  else if (orderFilter === 'payment_success') mFilter = order.paymentStatus === 'paid';
                  else if (orderFilter === 'refund_initiated') mFilter = order.refund?.status === 'pending';
                  else if (orderFilter === 'refund_approved') mFilter = order.refund?.status === 'completed';

                  return mSearch && mFilter;
                }).length} orders
              </p>
              <select
                value={orderFilter}
                onChange={e => setOrderFilter(e.target.value)}
                className="input-field py-1.5 text-sm"
              >
                <option value="all">All Orders</option>
                <optgroup label="Order Status">
                  <option value="placed">Placed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </optgroup>
                <optgroup label="Payment Status">
                  <option value="payment_pending">Payment: Pending</option>
                  <option value="payment_success">Payment: Success</option>
                </optgroup>
                <optgroup label="Refund Status">
                  <option value="refund_initiated">Refund: Initiated</option>
                  <option value="refund_approved">Refund: Approved</option>
                </optgroup>
              </select>
            </div>
            <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Search order ID or customer..." />
          </div>
          {orders.filter(order => {
            const mSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
              order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

            let mFilter = true;
            if (orderFilter === 'placed') mFilter = order.orderStatus === 'placed';
            else if (orderFilter === 'shipped') mFilter = order.orderStatus === 'shipped';
            else if (orderFilter === 'delivered') mFilter = order.orderStatus === 'delivered';
            else if (orderFilter === 'cancelled') mFilter = order.orderStatus === 'cancelled';
            else if (orderFilter === 'payment_pending') mFilter = order.paymentStatus === 'pending';
            else if (orderFilter === 'payment_success') mFilter = order.paymentStatus === 'paid';
            else if (orderFilter === 'refund_initiated') mFilter = order.refund?.status === 'pending';
            else if (orderFilter === 'refund_approved') mFilter = order.refund?.status === 'completed';

            return mSearch && mFilter;
          }).map(order => {
            const hasRefund = order.refund?.status && order.refund.status !== 'none';
            const isPendingRefund = order.refund?.status === 'pending';
            const st = order.orderStatus;
            const isCOD = order.paymentMethod === 'cod';
            // Status-based styles
            const statusStyles = {
              placed: { border: 'rgba(108,99,255,0.4)', bg: 'rgba(108,99,255,0.03)', accent: '#6C63FF', emoji: '📦' },
              shipped: { border: 'rgba(59,130,246,0.4)', bg: 'rgba(59,130,246,0.03)', accent: '#3B82F6', emoji: '🚚' },
              delivered: { border: 'rgba(16,185,129,0.4)', bg: 'rgba(16,185,129,0.06)', accent: '#10B981', emoji: '✅' },
              cancelled: { border: 'rgba(239,68,68,0.4)', bg: 'rgba(239,68,68,0.06)', accent: '#EF4444', emoji: '❌' },
              returned: { border: 'rgba(245,158,11,0.4)', bg: 'rgba(245,158,11,0.05)', accent: '#F59E0B', emoji: '🔄' },
            };
            const isPendingReturn = order.returnRequest?.status === 'pending';
            const ss = statusStyles[st] || statusStyles.placed;
            return (
              <div key={order._id} className="glass rounded-xl p-5 transition-all"
                style={{
                  borderLeft: isPendingReturn ? '4px solid #F59E0B' : `4px solid ${ss.accent}`,
                  background: isPendingReturn || isPendingRefund ? 'rgba(245,158,11,0.08)' : ss.bg,
                  borderColor: isPendingReturn ? 'rgba(245,158,11,0.4)' : undefined
                }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ fontSize: '16px' }}>{ss.emoji}</span>
                      <p className="text-white font-medium">#{order._id.slice(-8).toUpperCase()}</p>
                      <span className="badge text-xs" style={{ background: `${ss.accent}20`, color: ss.accent }}>{st.toUpperCase()}</span>
                      {/* Payment method badge */}
                      {isCOD ? (
                        <span className="badge text-xs bg-amber-500/15 text-amber-400">💵 COD (+₹{order.codFee || 25})</span>
                      ) : order.paymentId ? (
                        <span className="badge text-xs bg-green-500/15 text-green-400">💳 Online</span>
                      ) : null}
                      {hasRefund && (
                        <span className={`badge text-xs ${isPendingRefund ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                          💰 Refund: ₹{order.refund.amount?.toLocaleString()} ({order.refund.status})
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{order.user?.name} <span className="text-gray-600">·</span> {order.user?.email}</p>
                    <p className="text-gray-500 text-xs">{order.user?.phone || ''} · {new Date(order.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-bold text-lg">₹{order.totalAmount?.toLocaleString()}</span>
                    <select value={order.orderStatus} onChange={e => requestStatusChange(order._id, e.target.value)}
                      className="admin-select text-xs">
                      {['placed', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                {/* Shipping address */}
                {order.shippingAddress && (
                  <div className="glass rounded-lg p-2 px-3 mb-3 text-xs text-gray-400">
                    📍 {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                    {order.shippingAddress.phone && <span className="ml-2">📞 {order.shippingAddress.phone}</span>}
                  </div>
                )}
                <div className="overflow-x-auto mb-3">
                  <table className="w-full text-xs">
                    <thead><tr className="text-gray-500"><th className="text-left py-1">Item</th><th className="text-center py-1">Qty</th><th className="text-right py-1">Price</th><th className="text-right py-1">Subtotal</th></tr></thead>
                    <tbody>
                      {order.items.map((item, i) => (
                        <tr key={i} className="border-t border-white/5">
                          <td className="py-1.5"><div className="flex items-center gap-2"><img src={item.image || item.product?.image} alt="" className="w-7 h-7 rounded object-cover" /><span className="text-gray-300">{item.name || item.product?.name}</span></div></td>
                          <td className="py-1.5 text-center text-gray-300">{item.quantity}</td>
                          <td className="py-1.5 text-right text-gray-300">₹{item.price?.toLocaleString()}</td>
                          <td className="py-1.5 text-right text-white">₹{(item.price * item.quantity)?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => setSelectedOrder(order)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"><HiEye /> Details</button>
                  {order.returnRequest?.status === 'pending' && (
                    <div className="flex items-center gap-2 glass rounded-lg px-3 py-1.5">
                      <span className="text-warning text-xs">⚠ Return requested</span>
                      <button onClick={() => handleReturnAction(order._id, 'approve')} className="text-success text-xs font-medium hover:underline bg-transparent border-none cursor-pointer">Approve</button>
                      <button onClick={() => handleReturnAction(order._id, 'reject')} className="text-error text-xs font-medium hover:underline bg-transparent border-none cursor-pointer">Reject</button>
                    </div>
                  )}
                  {isPendingRefund && (
                    <button onClick={async () => {
                      try { await API.put(`/admin/orders/${order._id}/refund-complete`); toast.success('Refund marked complete'); loadData(); }
                      catch (err) { toast.error('Failed to update refund'); }
                    }} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                      💰 Mark Refund Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contacts / Messages */}
      {tab === 'contacts' && (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">{contacts.length} messages</p>
          {contacts.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <HiMail className="text-4xl text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No contact messages yet</p>
            </div>
          ) : (
            contacts.map(c => (
              <div key={c._id} className={`glass rounded-xl p-5 transition-all ${c.status === 'new' ? 'ring-1 ring-primary/30' : ''}`}
                style={c.status === 'new' ? { background: 'rgba(108,99,255,0.05)' } : {}}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-white font-medium">{c.name} <span className="text-gray-500 text-sm">— {c.email}</span></p>
                    <p className="text-gray-500 text-xs">{new Date(c.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs ${c.status === 'new' ? 'bg-primary/20 text-primary' : c.status === 'read' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                      {c.status}
                    </span>
                    <select value={c.status} onChange={async (e) => {
                      try { await API.put(`/contact/${c._id}`, { status: e.target.value }); toast.success('Status updated'); loadData(); }
                      catch (err) { toast.error('Failed'); }
                    }} className="admin-select text-xs">
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                    </select>
                    <button onClick={async () => {
                      try { await API.delete(`/contact/${c._id}`); toast.success('Deleted'); loadData(); }
                      catch (err) { toast.error('Failed'); }
                    }} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded bg-transparent border-none cursor-pointer"><HiTrash /></button>
                  </div>
                </div>
                <div className="glass rounded-lg p-3">
                  <p className="text-primary text-sm font-medium mb-1">{c.subject}</p>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{c.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Categories */}
      {tab === 'categories' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-gray-400 text-sm">{categories.length} categories</p>
            <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Filter categories..." />
          </div>
          {/* Add Category */}
          <div className="glass-strong rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><HiTag /> Add Category</h3>
            <div className="flex gap-3">
              <input value={newCategory} onChange={e => setNewCategory(e.target.value)} className="input-field flex-1" placeholder="Category name (e.g. Mobile, Laptop, Shoes)" />
              <button onClick={async () => {
                if (!newCategory.trim()) return toast.error('Enter a category name');
                try { await API.post('/categories', { name: newCategory.trim() }); toast.success('Category added!'); setNewCategory(''); loadData(); }
                catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
              }} className="btn-accent px-6 flex items-center gap-1 whitespace-nowrap"><HiPlus /> Add</button>
            </div>
          </div>

          {/* Category List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(cat => (
              <div key={cat._id} className="glass rounded-xl p-4 flex items-center justify-between group hover:border-primary/30 transition-all">
                {editCategory?._id === cat._id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input value={editCategory.name} onChange={e => setEditCategory({ ...editCategory, name: e.target.value })} className="input-field py-1.5 text-sm flex-1" />
                    <button onClick={async () => {
                      try { await API.put(`/categories/${cat._id}`, { name: editCategory.name }); toast.success('Updated'); setEditCategory(null); loadData(); }
                      catch (err) { toast.error('Failed'); }
                    }} className="p-1.5 text-success hover:bg-success/10 rounded bg-transparent border-none cursor-pointer"><HiCheck /></button>
                    <button onClick={() => setEditCategory(null)} className="p-1.5 text-gray-400 hover:bg-white/10 rounded bg-transparent border-none cursor-pointer"><HiX /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(108,99,255,0.05))' }}>
                        <HiTag className="text-primary text-sm" />
                      </div>
                      <span className="text-white font-medium text-sm">{cat.name}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditCategory({ ...cat })} className="p-1.5 text-primary hover:bg-primary/10 rounded bg-transparent border-none cursor-pointer"><HiPencil /></button>
                      <button onClick={async () => {
                        try { await API.delete(`/categories/${cat._id}`); toast.success('Deleted'); loadData(); }
                        catch (err) { toast.error('Failed'); }
                      }} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded bg-transparent border-none cursor-pointer"><HiTrash /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          {categories.length === 0 && (
            <div className="glass rounded-xl p-8 text-center">
              <HiTag className="text-4xl text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No categories yet. Add your first category above.</p>
            </div>
          )}
        </div>
      )}

      {/* Notifications / Alerts */}
      {tab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-sm">{notifications.length} alerts</p>
            {notifications.some(n => !n.isRead) && (
              <button onClick={() => notifications.forEach(n => !n.isRead && markAsRead(n._id))} className="text-primary text-xs font-semibold hover:underline bg-transparent border-none cursor-pointer">Mark all as read</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <HiExclamation className="text-4xl text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">All clear! No new alerts.</p>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n._id} onMouseEnter={() => !n.isRead && markAsRead(n._id)}
                className={`glass rounded-xl p-4 transition-all hover:border-white/20 ${!n.isRead ? 'ring-1 ring-primary/30' : ''}`}
                style={!n.isRead ? { background: 'rgba(108,99,255,0.05)' } : {}}>
                <div className="flex justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${n.type === 'RETURN_REQUESTED' ? 'bg-warning' : 'bg-primary'}`} />
                      <p className="text-white font-medium text-sm">{n.type.replace('_', ' ')}</p>
                      <span className="text-gray-500 text-[10px]">{new Date(n.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{n.message}</p>
                    <div className="flex gap-2">
                      {n.order && (
                        <button onClick={() => {
                          const oid = typeof n.order === 'object' ? n.order._id : n.order;
                          const fullOrder = orders.find(o => o._id === oid);
                          if (fullOrder) {
                            setSelectedOrder(fullOrder);
                            setTab('orders');
                          } else {
                            toast.error('Order not found in memory. Please refresh.');
                          }
                        }} className="text-primary text-xs font-medium hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer">
                          <HiEye /> View Order
                        </button>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteNotification(n._id)} className="p-1.5 text-gray-500 hover:text-red-400 rounded transition-all bg-transparent border-none cursor-pointer self-start">
                    <HiTrash className="text-lg" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
