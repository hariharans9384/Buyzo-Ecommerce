import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { HiShoppingCart, HiStar, HiArrowLeft, HiShieldCheck, HiChevronLeft, HiChevronRight, HiPhotograph, HiX, HiPlus, HiEye, HiPencil, HiTrash, HiExclamation, HiTruck, HiRefresh } from 'react-icons/hi';
import API from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import jsonProducts from '../data/products.json';

function ImageLightbox({ open, images, index, onClose, onNext, onPrev }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight') onNext();
        if (e.key === 'ArrowLeft') onPrev();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open, onClose, onNext, onPrev]);

  if (!open || !images || images.length === 0) return null;

  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)' }} onClick={onClose} className="animate-fadeIn">
      <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10001, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', width: '44px', height: '44px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-red-500 hover:scale-110">
        <HiX style={{ fontSize: '20px' }} />
      </button>

      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onPrev(); }} style={{ position: 'absolute', left: '24px', zIndex: 10001, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', width: '56px', height: '56px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-primary hover:text-dark hover:scale-110">
            <HiChevronLeft style={{ fontSize: '28px' }} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onNext(); }} style={{ position: 'absolute', right: '24px', zIndex: 10001, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', width: '56px', height: '56px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-primary hover:text-dark hover:scale-110">
            <HiChevronRight style={{ fontSize: '28px' }} />
          </button>
        </>
      )}

      <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', itemsAlign: 'center', gap: '16px' }} onClick={e => e.stopPropagation()}>
        <img src={images[index]} alt="Full screen preview" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)' }} />
        {images.length > 1 && (
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '20px', color: '#CBD5E1', fontSize: '12px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.08)' }}>
            {index + 1} / {images.length}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmText = 'Yes, Delete', cancelText = 'Cancel' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} onClick={onCancel}>
      <div style={{ background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '400px', margin: '0 16px', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}
        className="animate-fadeIn" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiExclamation style={{ color: '#D4AF37', fontSize: '22px' }} />
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

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, token } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewImagePreviews, setReviewImagePreviews] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [showOnlyWithPhotos, setShowOnlyWithPhotos] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, reviewId: null });
  const [existingImages, setExistingImages] = useState([]);
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
  const autoSlideRef = useRef(null);

  useEffect(() => {
    API.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => {
        const foundLocal = jsonProducts.find(p => p.id === id || p._id === id);
        if (foundLocal) {
          setProduct(foundLocal);
        } else {
          navigate('/products');
        }
      })
      .finally(() => setLoading(false));

    API.get(`/reviews/product/${id}`).then(res => setReviews(res.data)).catch(() => setReviews([]));
  }, [id, navigate]);

  useEffect(() => {
    if (token) {
      API.get(`/reviews/can-review/${id}`).then(res => setCanReview(res.data.canReview)).catch(() => setCanReview(false));
    }
  }, [id, token, reviews]);

  const allImages = (product?.images?.length > 0)
    ? product.images
    : [product?.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60'];

  const productId = product?._id || product?.id;
  const stockCount = product?.stock !== undefined ? product.stock : (product?.inStock !== undefined ? product.inStock : 10);

  const handleAddToCart = async () => {
    try {
      if (addToCart) await addToCart(productId, qty);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      toast('Please sign in to checkout', { icon: '🔐' });
      navigate('/login');
      return;
    }
    sessionStorage.setItem('buyNowItem', JSON.stringify({
      product: { _id: productId, name: product.name, image: allImages[0], price: product.price },
      quantity: qty
    }));
    navigate('/checkout?buyNow=true');
  };

  const handleRemoveImage = (index) => {
    const newFiles = [...reviewImages];
    newFiles.splice(index, 1);
    setReviewImages(newFiles);

    const newPreviews = [...reviewImagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setReviewImagePreviews(newPreviews);
  };

  const openLightbox = (images, index) => {
    setLightbox({ open: true, images, index });
  };

  const closeLightbox = () => {
    setLightbox({ ...lightbox, open: false });
  };

  const nextImage = () => {
    setLightbox(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length }));
  };

  const prevImage = () => {
    setLightbox(prev => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }));
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review._id);
    setReviewForm({ rating: review.rating, comment: review.comment });
    setExistingImages(review.images || []);
    setReviewImages([]);
    setReviewImagePreviews([]);
    window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' });
  };

  const handleDeleteReview = (reviewId) => {
    setDeleteConfirm({ open: true, reviewId });
  };

  const confirmDeleteReview = async () => {
    if (!deleteConfirm.reviewId) return;
    try {
      await API.delete(`/reviews/${deleteConfirm.reviewId}`);
      toast.success('Review deleted successfully');
      
      if (editingReviewId === deleteConfirm.reviewId) {
        setEditingReviewId(null);
        setReviewForm({ rating: 5, comment: '' });
        setExistingImages([]);
        setReviewImages([]);
        setReviewImagePreviews([]);
      }
      
      const [revRes, prodRes] = await Promise.all([
        API.get(`/reviews/product/${id}`), 
        API.get(`/products/${id}`).catch(() => ({ data: product }))
      ]);
      
      setReviews(revRes.data);
      setProduct(prodRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeleteConfirm({ open: false, reviewId: null });
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) { toast.error('Please write a review comment'); return; }
    setSubmittingReview(true);
    try {
      const formData = new FormData();
      formData.append('rating', reviewForm.rating);
      formData.append('comment', reviewForm.comment);
      
      if (editingReviewId) {
        existingImages.forEach(img => formData.append('keepExistingImages', img));
      } else {
        formData.append('productId', id);
      }

      reviewImages.forEach(file => formData.append('images', file));

      if (editingReviewId) {
        await API.put(`/reviews/${editingReviewId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Review updated!');
      } else {
        await API.post('/reviews', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Review posted!');
      }

      setReviewForm({ rating: 5, comment: '' });
      setReviewImages([]);
      setReviewImagePreviews([]);
      setEditingReviewId(null);
      setExistingImages([]);

      const [revRes] = await Promise.all([API.get(`/reviews/product/${id}`)]);
      setReviews(revRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const goTo = useCallback((idx) => {
    clearInterval(autoSlideRef.current);
    setCurrentImg(idx);
    autoSlideRef.current = setInterval(() => {
      setCurrentImg(prev => (prev + 1) % allImages.length);
    }, 4000);
  }, [allImages.length]);

  useEffect(() => {
    if (allImages.length <= 1) return;
    autoSlideRef.current = setInterval(() => {
      setCurrentImg(prev => (prev + 1) % allImages.length);
    }, 4000);
    return () => clearInterval(autoSlideRef.current);
  }, [allImages.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!product) return null;

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 bg-white/5 px-4 py-2 rounded-xl border border-white/10 transition cursor-pointer text-sm font-semibold">
        <HiArrowLeft /> Back to Catalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="glass-strong rounded-3xl overflow-hidden aspect-square relative group border border-white/10 shadow-2xl">
            <img src={allImages[currentImg]} alt={product.name} className="w-full h-full object-cover transition-opacity duration-500" />
            {discount > 0 && (
              <span className="absolute top-4 left-4 badge text-dark text-sm px-3.5 py-1.5 font-bold shadow-lg" style={{ background: 'linear-gradient(135deg, #E29578, #D4AF37)' }}>
                {discount}% OFF
              </span>
            )}
            {allImages.length > 1 && (
              <>
                <button onClick={() => goTo((currentImg - 1 + allImages.length) % allImages.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white text-2xl bg-black/50 hover:bg-primary hover:text-dark border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md">
                  <HiChevronLeft />
                </button>
                <button onClick={() => goTo((currentImg + 1) % allImages.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-white text-2xl bg-black/50 hover:bg-primary hover:text-dark border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md">
                  <HiChevronRight />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {allImages.map((_, i) => (
                    <button key={i} onClick={() => goTo(i)}
                      className={`w-2.5 h-2.5 rounded-full border-none cursor-pointer transition-all ${i === currentImg ? 'bg-primary scale-125' : 'bg-white/40 hover:bg-white/70'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 cursor-pointer transition-all ${i === currentImg ? 'border-primary ring-4 ring-primary/20' : 'border-white/10 hover:border-white/30'}`}
                  style={{ background: 'none', padding: 0 }}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details info */}
        <div className="flex flex-col justify-center glass-strong rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs text-secondary font-bold uppercase tracking-wider bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
              {product.category}
            </span>
            {product.brand && <span className="text-xs text-gray-400 font-semibold">{product.brand}</span>}
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4 tracking-tight leading-tight">{product.name}</h1>
          
          <div className="flex items-center gap-2 mb-6">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <HiStar key={i} className={`text-xl ${i < Math.floor(product.rating || 4.5) ? 'text-amber-400' : 'text-gray-600'}`} />
              ))}
            </div>
            <span className="text-gray-300 font-medium text-sm">({product.numReviews || reviews.length || 12} reviews)</span>
          </div>

          <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-4xl font-black text-white">₹{product.price?.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-xl text-gray-500 line-through">₹{product.originalPrice?.toLocaleString()}</span>
            )}
            {discount > 0 && (
              <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                Save ₹{(product.originalPrice - product.price).toLocaleString()}
              </span>
            )}
          </div>

          <p className="text-gray-300 leading-relaxed text-sm sm:text-base mb-6">{product.description}</p>

          <div className="flex items-center gap-4 mb-8">
            <span className="text-gray-300 text-sm font-semibold">Quantity:</span>
            <div className="flex items-center bg-white/5 border border-white/15 rounded-xl">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3.5 py-2 text-white hover:bg-white/10 rounded-l-xl transition bg-transparent border-none cursor-pointer text-lg font-bold">−</button>
              <span className="px-5 text-white font-bold text-sm">{qty}</span>
              <button onClick={() => setQty(Math.min(stockCount, qty + 1))} className="px-3.5 py-2 text-white hover:bg-white/10 rounded-r-xl transition bg-transparent border-none cursor-pointer text-lg font-bold">+</button>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${stockCount > 5 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : stockCount > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              {stockCount > 0 ? `${stockCount} units available` : 'Out of stock'}
            </span>
          </div>

          <div className="flex gap-4 flex-wrap">
            <button onClick={handleAddToCart} disabled={stockCount === 0} className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
              <HiShoppingCart className="text-lg" /> Add to Shopping Cart
            </button>
            <button onClick={handleBuyNow} disabled={stockCount === 0} className="btn-accent flex-1 py-3.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
              Buy Now
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
              <HiTruck className="text-primary text-base" /> Free Delivery
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
              <HiRefresh className="text-secondary text-base" /> 7-Day Exchange
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
              <HiShieldCheck className="text-accent text-base" /> 1-Year Warranty
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="glass-strong rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Customer Reviews ({reviews.length})</h2>
          
          {reviews.some(r => r.images?.length > 0) && (
            <button 
              onClick={() => setShowOnlyWithPhotos(!showOnlyWithPhotos)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${showOnlyWithPhotos ? 'bg-primary border-primary text-dark shadow-lg font-bold' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
            >
              <HiPhotograph className={showOnlyWithPhotos ? 'text-dark' : 'text-gray-400'} />
              Show Photos Only
            </button>
          )}
        </div>

        {/* Review Form */}
        {(user && canReview) || editingReviewId ? (
          <form onSubmit={handleSubmitReview} className="glass rounded-2xl p-6 mb-8 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <HiShieldCheck className="text-emerald-400 text-lg" /> {editingReviewId ? 'Edit Your Review' : 'Write a Verified Review'}
              </h3>
              {editingReviewId && (
                <button type="button" onClick={() => {
                  setEditingReviewId(null);
                  setReviewForm({ rating: 5, comment: '' });
                  setExistingImages([]);
                  setReviewImages([]);
                  setReviewImagePreviews([]);
                }} className="text-gray-400 hover:text-white bg-transparent border-none cursor-pointer text-xs flex items-center gap-1 font-semibold">
                  <HiX /> Cancel Edit
                </button>
              )}
            </div>

            <div className="mb-4">
              <label className="text-gray-300 text-xs font-semibold uppercase tracking-wider block mb-2">Rating</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                    className="bg-transparent border-none cursor-pointer text-2xl transition transform hover:scale-125">
                    <HiStar className={s <= reviewForm.rating ? 'text-amber-400' : 'text-gray-700'} />
                  </button>
                ))}
              </div>
            </div>

            <textarea value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
              className="input-field text-sm mb-4" rows="3" placeholder="Describe your experience with this product..." maxLength={500} />
            
            <div className="mb-5">
              <label className="text-gray-300 text-xs font-semibold uppercase tracking-wider block mb-2 flex items-center gap-2">
                <HiPhotograph className="text-indigo-400" /> Attach Photos (Up to 5)
              </label>
              
              <div className="flex flex-wrap gap-3 mb-2">
                {existingImages.map((src, i) => (
                  <div key={`exist-${i}`} className="relative w-20 h-20 group">
                    <img src={src} alt="" className="w-full h-full rounded-xl object-cover border border-white/10" />
                    <button type="button" onClick={() => {
                      const newExisting = [...existingImages];
                      newExisting.splice(i, 1);
                      setExistingImages(newExisting);
                    }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs border-2 border-slate-900 cursor-pointer shadow-lg">
                      <HiX />
                    </button>
                  </div>
                ))}

                {reviewImagePreviews.map((src, i) => (
                  <div key={`new-${i}`} className="relative w-20 h-20 group">
                    <img src={src} alt="" className="w-full h-full rounded-xl object-cover border border-white/10" />
                    <button type="button" onClick={() => handleRemoveImage(i)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs border-2 border-slate-900 cursor-pointer shadow-lg">
                      <HiX />
                    </button>
                  </div>
                ))}
                
                {(existingImages.length + reviewImages.length) < 5 && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary hover:text-primary-light transition cursor-pointer bg-white/5">
                    <HiPlus className="text-xl" />
                    <span className="text-[10px] font-bold">Add Photo</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={e => {
                      const newFiles = Array.from(e.target.files);
                      const totalFiles = [...reviewImages, ...newFiles];
                      if ((existingImages.length + totalFiles.length) > 5) { toast.error('Max 5 images allowed'); return; }
                      setReviewImages(totalFiles);
                      setReviewImagePreviews([...reviewImagePreviews, ...newFiles.map(f => URL.createObjectURL(f))]);
                    }} />
                  </label>
                )}
              </div>
            </div>

            <button type="submit" disabled={submittingReview} className="btn-primary py-2.5 px-6 text-sm disabled:opacity-50">
              {submittingReview ? 'Posting Review...' : 'Submit Review'}
            </button>
          </form>
        ) : null}

        {/* Reviews List */}
        {reviews.filter(r => showOnlyWithPhotos ? r.images?.length > 0 : true).length === 0 ? (
          <div className="text-center py-12 glass rounded-2xl border border-white/10">
            <p className="text-gray-400 text-sm">
              {showOnlyWithPhotos ? "No reviews with photos attached." : "No reviews submitted yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews
              .filter(review => showOnlyWithPhotos ? review.images?.length > 0 : true)
              .map(review => (
              <div key={review._id} className="glass rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold text-dark shadow-md" style={{ background: 'linear-gradient(135deg, #D4AF37, #E29578)' }}>
                      {review.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm flex items-center gap-2">
                        {review.userName}
                        <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold">Verified Buyer</span>
                      </p>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <HiStar key={i} className={`text-xs ${i < review.rating ? 'text-amber-400' : 'text-gray-700'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {user && user._id === review.user && (
                      <div className="flex gap-1">
                        <button onClick={() => handleEditReview(review)} className="p-1.5 text-primary hover:bg-white/10 rounded-lg transition border-none cursor-pointer bg-transparent">
                          <HiPencil />
                        </button>
                        <button onClick={() => handleDeleteReview(review._id)} className="p-1.5 text-rose-400 hover:bg-white/10 rounded-lg transition border-none cursor-pointer bg-transparent">
                          <HiTrash />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">{review.comment}</p>
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-3 flex-wrap">
                    {review.images.map((img, i) => (
                      <div key={i} onClick={() => openLightbox(review.images, i)} className="relative group cursor-pointer">
                        <img src={img} alt="Review upload" className="w-20 h-20 rounded-xl object-cover border border-white/10 group-hover:border-primary transition-all" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                          <HiEye className="text-white text-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal 
        open={deleteConfirm.open} 
        title="Delete Review" 
        message="Are you sure you want to delete this review? This action cannot be undone." 
        onConfirm={confirmDeleteReview} 
        onCancel={() => setDeleteConfirm({ open: false, reviewId: null })} 
      />

      <ImageLightbox 
        open={lightbox.open}
        images={lightbox.images}
        index={lightbox.index}
        onClose={closeLightbox}
        onNext={nextImage}
        onPrev={prevImage}
      />
    </div>
  );
}
