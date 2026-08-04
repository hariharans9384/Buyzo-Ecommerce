import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HiCurrencyRupee, HiShoppingBag, HiUsers, HiClipboardList, HiPencil, HiTrash, HiPlus, HiCheck, HiX, HiRefresh, HiEye, HiArrowLeft, HiTrendingUp, HiExclamation, HiMail, HiTag, HiPhotograph, HiSearch, HiTruck } from 'react-icons/hi';
import API from '../utils/api';
import toast from 'react-hot-toast';

function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmText = 'Yes, Confirm', cancelText = 'Cancel' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} onClick={onCancel}>
      <div style={{ background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', margin: '0 16px', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}
        className="animate-fadeIn" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', itemsAlign: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiExclamation style={{ color: '#6366F1', fontSize: '22px' }} />
          </div>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '18px', margin: 0 }}>{title}</h3>
        </div>
        <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onConfirm} className="btn-primary" style={{ flex: 1, padding: '10px 0' }}>{confirmText}</button>
          <button onClick={onCancel} className="btn-secondary" style={{ flex: 1, padding: '10px 0' }}>{cancelText}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function SearchBox({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative flex-1 max-w-sm">
      <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10 py-2.5 text-xs sm:text-sm w-full"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white bg-transparent border-none cursor-pointer">
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
  const [productImages, setProductImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');

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
    } catch (err) { toast.error('Failed to load dashboard metrics'); }
    finally { setLoading(false); }
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
    try { await API.delete(`/products/${id}`); toast.success('Product deleted!'); loadData(); }
    catch (err) { toast.error('Delete failed'); }
  };

  const confirmStatusUpdate = () => {
    const { orderId, newStatus } = statusConfirm;
    setStatusConfirm({ open: false, orderId: null, newStatus: '' });
    API.put(`/admin/orders/${orderId}`, { orderStatus: newStatus })
      .then(() => { toast.success(`Order status updated to "${newStatus}"`); loadData(); })
      .catch(() => toast.error('Failed to update status'));
  };

  const requestStatusChange = (orderId, newStatus) => {
    setStatusConfirm({ open: true, orderId, newStatus });
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: HiCurrencyRupee },
    { id: 'products', label: 'Products', icon: HiShoppingBag },
    { id: 'orders', label: 'Orders', icon: HiClipboardList, badge: stats?.pendingReturns || 0 },
    { id: 'contacts', label: 'Messages', icon: HiMail },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <ConfirmModal
        open={statusConfirm.open}
        title="Update Order Status"
        message={`Change status to "${statusConfirm.newStatus}"? Customer will receive email update.`}
        onConfirm={confirmStatusUpdate}
        onCancel={() => setStatusConfirm({ open: false, orderId: null, newStatus: '' })}
        confirmText="Yes, Update"
      />

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Control Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Manage store inventory, customer orders, and executive metrics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 border-b border-white/10">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSearchQuery(''); setOrderFilter('all'); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all border-none cursor-pointer whitespace-nowrap relative ${
              tab === t.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <t.icon className="text-base" /> {t.label}
            {t.badge > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Revenue', value: `₹${stats.totalRevenue?.toLocaleString()}`, icon: HiCurrencyRupee, color: '#6366F1' },
              { label: 'Total Orders', value: stats.totalOrders, icon: HiClipboardList, color: '#EC4899' },
              { label: 'Active Products', value: stats.totalProducts, icon: HiShoppingBag, color: '#06B6D4' },
              { label: 'Registered Users', value: stats.totalUsers, icon: HiUsers, color: '#10B981' },
            ].map((s, i) => (
              <div key={i} className="glass-strong rounded-3xl p-6 border border-white/10 shadow-2xl">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-white/5 border border-white/10">
                  <s.icon className="text-2xl" style={{ color: s.color }} />
                </div>
                <p className="text-3xl font-black text-white">{s.value}</p>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {stats.topProducts?.length > 0 && (
            <div className="glass-strong rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 tracking-tight">
                <HiTrendingUp className="text-indigo-400" /> Best Selling Products
              </h3>
              <div className="space-y-3">
                {stats.topProducts.map((p, i) => (
                  <div key={p._id} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold">
                      #{i + 1}
                    </span>
                    <img src={p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60'} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm line-clamp-1">{p.name}</p>
                    </div>
                    <span className="text-indigo-400 font-extrabold text-sm">{p.totalSold || 0} units sold</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Products Tab */}
      {tab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-1 w-full">
              <span className="text-gray-400 text-sm font-semibold">{products.length} products</span>
              <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Search products..." />
            </div>
            <button onClick={() => openProductForm()} className="btn-primary flex items-center gap-2 text-sm font-semibold rounded-xl py-2.5">
              <HiPlus /> Add New Product
            </button>
          </div>

          {productFormOpen && (
            <div className="glass-strong rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl animate-fadeIn space-y-4">
              <h3 className="text-white font-bold text-lg">{productFormData._id ? 'Edit Product' : 'Add New Product'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input value={productFormData.name} onChange={e => setProductFormData({ ...productFormData, name: e.target.value })} className="input-field" placeholder="Product Title" />
                <input value={productFormData.category} onChange={e => setProductFormData({ ...productFormData, category: e.target.value })} className="input-field" placeholder="Category (e.g. Audio, Wearables)" />
                <input value={productFormData.price} onChange={e => setProductFormData({ ...productFormData, price: e.target.value })} className="input-field" placeholder="Selling Price (₹)" type="number" />
                <input value={productFormData.originalPrice} onChange={e => setProductFormData({ ...productFormData, originalPrice: e.target.value })} className="input-field" placeholder="Original MRP (₹)" type="number" />
                <input value={productFormData.stock} onChange={e => setProductFormData({ ...productFormData, stock: e.target.value })} className="input-field" placeholder="Stock Count" type="number" />

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="featured" checked={Boolean(productFormData.featured)} onChange={e => setProductFormData({ ...productFormData, featured: e.target.checked })} className="cursor-pointer" />
                  <label htmlFor="featured" className="text-sm text-gray-300 cursor-pointer font-medium">Mark as Featured</label>
                </div>

                <textarea value={productFormData.description} onChange={e => setProductFormData({ ...productFormData, description: e.target.value })} className="input-field sm:col-span-2" placeholder="Product Description" rows="3" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleProductSubmit} className="btn-primary px-6 py-2.5 text-sm">Save Product</button>
                <button onClick={() => setProductFormOpen(false)} className="btn-secondary px-6 py-2.5 text-sm">Cancel</button>
              </div>
            </div>
          )}

          <div className="glass-strong rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-left border-b border-white/10 text-xs uppercase tracking-wider bg-white/5">
                    <th className="p-4">Product Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(p => (
                      <tr key={p._id || p.id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60'} alt="" className="w-12 h-12 rounded-xl object-cover" />
                            <span className="text-white font-bold">{p.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300 font-medium">{p.category}</td>
                        <td className="p-4 font-bold text-white">₹{p.price?.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${p.stock > 5 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {p.stock ?? 10} in stock
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => openProductForm(p)} className="p-2 text-indigo-400 hover:bg-white/10 rounded-lg transition border-none cursor-pointer bg-transparent">
                              <HiPencil className="text-base" />
                            </button>
                            <button onClick={() => handleDeleteProduct(p._id)} className="p-2 text-rose-400 hover:bg-white/10 rounded-lg transition border-none cursor-pointer bg-transparent">
                              <HiTrash className="text-base" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <span className="text-gray-400 text-sm font-semibold">{orders.length} Total Orders</span>
            <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Search order ID or customer..." />
          </div>

          <div className="space-y-4">
            {orders
              .filter(o => o._id.toLowerCase().includes(searchQuery.toLowerCase()) || o.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(o => (
                <div key={o._id} className="glass-strong rounded-3xl p-6 border border-white/10 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-white font-bold text-base">Order #{o._id.slice(-8).toUpperCase()}</p>
                      <p className="text-gray-400 text-xs">{o.user?.name} ({o.user?.email})</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={o.orderStatus}
                        onChange={e => requestStatusChange(o._id, e.target.value)}
                        className="bg-white/5 border border-white/15 rounded-xl py-1.5 px-3 text-white text-xs font-semibold cursor-pointer outline-none"
                      >
                        {['placed', 'shipped', 'delivered', 'cancelled'].map(s => (
                          <option key={s} value={s} className="bg-slate-900 text-white">{s.toUpperCase()}</option>
                        ))}
                      </select>
                      <span className="text-white font-black text-lg">₹{o.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Contact Messages Tab */}
      {tab === 'contacts' && (
        <div className="space-y-4">
          {contacts.length === 0 ? (
            <div className="text-center py-12 glass-strong rounded-3xl p-8 border border-white/10">
              <p className="text-gray-400 text-sm">No messages received yet.</p>
            </div>
          ) : (
            contacts.map(c => (
              <div key={c._id} className="glass-strong rounded-3xl p-6 border border-white/10 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-bold text-base">{c.name} ({c.email})</h3>
                  <span className="text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <p className="text-indigo-400 font-semibold text-xs mb-2">Subject: {c.subject}</p>
                <p className="text-gray-300 text-sm leading-relaxed">{c.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
