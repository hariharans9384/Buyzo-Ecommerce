import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { HiShoppingCart, HiStar, HiArrowLeft, HiShieldCheck, HiChevronLeft, HiChevronRight, HiPhotograph, HiX, HiPlus, HiEye, HiPencil, HiTrash, HiExclamation } from 'react-icons/hi';
import API from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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
      {/* Close Button */}
      <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10001, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', width: '44px', height: '44px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-error hover:scale-110">
        <HiX style={{ fontSize: '20px' }} />
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onPrev(); }} style={{ position: 'absolute', left: '24px', zIndex: 10001, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', width: '56px', height: '56px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-primary/20 hover:scale-110">
            <HiChevronLeft style={{ fontSize: '28px' }} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onNext(); }} style={{ position: 'absolute', right: '24px', zIndex: 10001, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', width: '56px', height: '56px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-primary/20 hover:scale-110">
            <HiChevronRight style={{ fontSize: '28px' }} />
          </button>
        </>
      )}

      {/* Image Container */}
      <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }} onClick={e => e.stopPropagation()}>
        <img src={images[index]} alt="Full screen preview" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }} className="animate-scaleIn" />
        {images.length > 1 && (
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '20px', color: '#9ca3af', fontSize: '12px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.05)' }}>
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

  // Build image list safely: prefer uploaded images, fall back to legacy image field
  const allImages = (product?.images?.length > 0)
    ? product.images
    : [product?.image || 'https://via.placeholder.com/600'];

  useEffect(() => {
    API.get(`/products/${id}`).then(res => setProduct(res.data)).catch(() => navigate('/products')).finally(() => setLoading(false));
    API.get(`/reviews/product/${id}`).then(res => setReviews(res.data)).catch(console.error);
  }, [id]);

  useEffect(() => {
    if (token) {
      API.get(`/reviews/can-review/${id}`).then(res => setCanReview(res.data.canReview)).catch(() => setCanReview(false));
    }
  }, [id, token, reviews]);

  const handleAddToCart = async () => {
    try { await addToCart(product._id, qty); toast.success('Added to cart!'); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleBuyNow = () => {
    if (!user) { toast('Please login to checkout', { icon: '🔐' }); navigate('/login'); return; }
    // Store only this product for direct checkout — does NOT touch cart
    sessionStorage.setItem('buyNowItem', JSON.stringify({
      product: { _id: product._id, name: product.name, image: allImages[0] || product.image, price: product.price },
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
    setLightbox(prev => ({
      ...prev,
      index: (prev.index + 1) % prev.images.length
    }));
  };

  const prevImage = () => {
    setLightbox(prev => ({
      ...prev,
      index: (prev.index - 1 + prev.images.length) % prev.images.length
    }));
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review._id);
    setReviewForm({ rating: review.rating, comment: review.comment });
    setExistingImages(review.images || []);
    setReviewImages([]);
    setReviewImagePreviews([]);
    window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' }); // Scroll towards reviews
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
      
      const [revRes, prodRes, canRevRes] = await Promise.all([
        API.get(`/reviews/product/${id}`), 
        API.get(`/products/${id}`),
        API.get(`/reviews/can-review/${id}`)
      ]);
      
      setReviews(revRes.data);
      setProduct(prodRes.data);
      setCanReview(canRevRes.data.canReview);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeleteConfirm({ open: false, reviewId: null });
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) { toast.error('Please write a review'); return; }
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
        await API.put(`/reviews/${editingReviewId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Review updated!');
      } else {
        await API.post('/reviews', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Review posted!');
      }

      setReviewForm({ rating: 5, comment: '' });
      setReviewImages([]);
      setReviewImagePreviews([]);
      setEditingReviewId(null);
      setExistingImages([]);

      const [revRes, prodRes] = await Promise.all([API.get(`/reviews/product/${id}`), API.get(`/products/${id}`)]);
      setReviews(revRes.data);
      setProduct(prodRes.data);

      if (!editingReviewId) {
        const { data: canRevData } = await API.get(`/reviews/can-review/${id}`);
        setCanReview(canRevData.canReview);
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post review'); }
    finally { setSubmittingReview(false); }
  };

  const goTo = useCallback((idx) => {
    clearInterval(autoSlideRef.current);
    setCurrentImg(idx);
    autoSlideRef.current = setInterval(() => {
      setCurrentImg(prev => (prev + 1) % allImages.length);
    }, 4000);
  }, [allImages.length]);

  // Auto-slide
  useEffect(() => {
    if (allImages.length <= 1) return;
    autoSlideRef.current = setInterval(() => {
      setCurrentImg(prev => (prev + 1) % allImages.length);
    }, 4000);
    return () => clearInterval(autoSlideRef.current);
  }, [allImages.length]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!product) return null;

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 bg-transparent border-none cursor-pointer text-sm"><HiArrowLeft /> Back</button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Image Slider */}
        <div className="space-y-3">
          <div className="glass rounded-2xl overflow-hidden aspect-square relative group">
            <img src={allImages[currentImg]} alt={product.name} className="w-full h-full object-cover transition-opacity duration-500" />
            {discount > 0 && <span className="absolute top-4 left-4 badge text-white text-sm px-3 py-1" style={{ background: 'linear-gradient(135deg, #FF6584, #FF4567)' }}>{discount}% OFF</span>}
            {allImages.length > 1 && (
              <>
                <button onClick={() => goTo((currentImg - 1 + allImages.length) % allImages.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl bg-black/40 hover:bg-black/60 border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <HiChevronLeft />
                </button>
                <button onClick={() => goTo((currentImg + 1) % allImages.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl bg-black/40 hover:bg-black/60 border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <HiChevronRight />
                </button>
                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {allImages.map((_, i) => (
                    <button key={i} onClick={() => goTo(i)}
                      className={`w-2.5 h-2.5 rounded-full border-none cursor-pointer transition-all ${i === currentImg ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 cursor-pointer transition-all ${i === currentImg ? 'border-primary ring-2 ring-primary/30' : 'border-white/10 hover:border-white/30'}`}
                  style={{ background: 'none', padding: 0 }}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <p className="text-primary font-medium uppercase tracking-wider text-sm mb-2">{product.category}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">{[...Array(5)].map((_, i) => <HiStar key={i} className={`text-lg ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-600'}`} />)}</div>
            <span className="text-gray-400">({product.numReviews} reviews)</span>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-white">₹{product.price?.toLocaleString()}</span>
            {product.originalPrice && <span className="text-xl text-gray-500 line-through">₹{product.originalPrice?.toLocaleString()}</span>}
            {discount > 0 && <span className="text-success font-medium">Save ₹{(product.originalPrice - product.price).toLocaleString()}</span>}
          </div>
          <p className="text-gray-300 leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-gray-400 text-sm">Quantity:</span>
            <div className="flex items-center glass rounded-lg">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-white bg-transparent border-none cursor-pointer text-lg">−</button>
              <span className="px-4 text-white font-bold">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2 text-white bg-transparent border-none cursor-pointer text-lg">+</button>
            </div>
            <span className={`text-sm ${product.stock > 10 ? 'text-success' : product.stock > 0 ? 'text-warning' : 'text-error'}`}>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-primary lg:flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50"><HiShoppingCart /> Add to Cart</button>
            <button onClick={handleBuyNow} disabled={product.stock === 0} className="btn-accent lg:flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50">Buy Now</button>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            {[{ icon: '🚚', text: 'Free Shipping on All Orders' }, { icon: '🔄', text: '7-Day Returns' }, { icon: '🔒', text: 'Secure Payment' }].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-400 text-xs"><span>{f.icon}</span>{f.text}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-white">Customer Reviews ({reviews.length})</h2>
          
          {reviews.some(r => r.images?.length > 0) && (
            <button 
              onClick={() => setShowOnlyWithPhotos(!showOnlyWithPhotos)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all border cursor-pointer ${showOnlyWithPhotos ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              <HiPhotograph className={showOnlyWithPhotos ? 'text-white' : 'text-gray-500'} />
              Show Reviews with Photos Only
            </button>
          )}
        </div>

        {/* Write / Edit Review Form */}
        {(user && canReview) || editingReviewId ? (
          <form onSubmit={handleSubmitReview} className="glass rounded-xl p-5 mb-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <HiShieldCheck className="text-success" /> {editingReviewId ? 'Edit Your Review' : 'Write a Review'}
              </h3>
              {editingReviewId && (
                <button type="button" onClick={() => {
                  setEditingReviewId(null);
                  setReviewForm({ rating: 5, comment: '' });
                  setExistingImages([]);
                  setReviewImages([]);
                  setReviewImagePreviews([]);
                }} className="text-gray-400 hover:text-white bg-transparent border-none cursor-pointer text-sm flex items-center gap-1">
                  <HiX /> Cancel Edit
                </button>
              )}
            </div>
            <div className="mb-3">
              <label className="text-gray-300 text-sm block mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                    className="bg-transparent border-none cursor-pointer text-2xl">
                    <HiStar className={s <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-600'} />
                  </button>
                ))}
              </div>
            </div>
            <textarea value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
              className="input-field text-sm mb-3" rows="3" placeholder="Share your experience with this product..." maxLength={500} />
            
            <div className="mb-4 text-left">
              <label className="text-gray-300 text-sm block mb-2 font-medium flex items-center gap-2">
                <HiPhotograph className="text-primary" /> Attach Photos (Max 5 total)
              </label>
              
              <div className="flex flex-wrap gap-3 mb-3">
                {existingImages.map((src, i) => (
                  <div key={`exist-${i}`} className="relative w-20 h-20 group">
                    <img src={src} alt="" className="w-full h-full rounded-xl object-cover border border-white/10 ring-2 ring-transparent group-hover:ring-primary/50 transition-all opacity-80" />
                    <button type="button" onClick={() => {
                      const newExisting = [...existingImages];
                      newExisting.splice(i, 1);
                      setExistingImages(newExisting);
                    }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-error text-white flex items-center justify-center text-xs border-2 border-[#1a1a2e] cursor-pointer hover:scale-110 transition-transform shadow-lg">
                      <HiX />
                    </button>
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-center text-white py-0.5 rounded-b-xl">Saved</span>
                  </div>
                ))}

                {reviewImagePreviews.map((src, i) => (
                  <div key={`new-${i}`} className="relative w-20 h-20 group">
                    <img src={src} alt="" className="w-full h-full rounded-xl object-cover border border-white/10 ring-2 ring-transparent group-hover:ring-primary/50 transition-all" />
                    <button type="button" onClick={() => handleRemoveImage(i)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-error text-white flex items-center justify-center text-xs border-2 border-[#1a1a2e] cursor-pointer hover:scale-110 transition-transform shadow-lg">
                      <HiX />
                    </button>
                  </div>
                ))}
                
                {(existingImages.length + reviewImages.length) < 5 && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-1 text-gray-500 hover:border-primary/50 hover:text-primary transition-all cursor-pointer bg-white/3">
                    <HiPlus className="text-xl" />
                    <span className="text-[10px] font-medium">Add Photo</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={e => {
                      const newFiles = Array.from(e.target.files);
                      const totalFiles = [...reviewImages, ...newFiles];
                      if ((existingImages.length + totalFiles.length) > 5) { toast.error('Max 5 images allowed in total'); return; }
                      setReviewImages(totalFiles);
                      setReviewImagePreviews([...reviewImagePreviews, ...newFiles.map(f => URL.createObjectURL(f))]);
                    }} />
                  </label>
                )}

              </div>
              <p className="text-gray-500 text-[10px] italic">Supported formats: JPG, PNG, WEBP (Max 5MB per file)</p>
            </div>

            <button type="submit" disabled={submittingReview} className="btn-primary py-2 px-6 disabled:opacity-50">
              {submittingReview ? 'Posting...' : 'Post Review'}
            </button>
          </form>
        ) : null}

        {/* Review Restriction Messages */}
        {user && !canReview && !editingReviewId && (
          <p className="text-gray-500 text-sm mb-6 italic">Only customers who purchased this product can leave a review, or you may have already reviewed it.</p>
        )}

        {!user && <p className="text-gray-500 text-sm mb-6 italic">Please login and purchase this product to leave a review.</p>}

        {/* Reviews List */}
        {reviews.filter(r => showOnlyWithPhotos ? r.images?.length > 0 : true).length === 0 ? (
          <div className="text-center py-10 glass rounded-xl border-dashed border-white/5">
            <p className="text-gray-400">
              {showOnlyWithPhotos ? "No reviews with photos yet." : "No reviews yet. Be the first to review!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews
              .filter(review => showOnlyWithPhotos ? review.images?.length > 0 : true)
              .map(review => (
              <div key={review._id} className="glass rounded-xl p-5 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #6C63FF, #FF6584)' }}>
                      {review.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm flex items-center gap-2">
                        {review.userName}
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        <span className="text-success text-[10px] uppercase tracking-wider font-bold">Verified Purchase</span>
                      </p>
                      <div className="flex gap-0.5 mt-0.5">{[...Array(5)].map((_, i) => <HiStar key={i} className={`text-xs ${i < review.rating ? 'text-yellow-400' : 'text-gray-700'}`} />)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {user && user._id === review.user && (
                      <div className="flex gap-1">
                        <button onClick={() => handleEditReview(review)} className="p-1.5 text-primary hover:bg-white/10 border border-transparent hover:border-white/10 rounded-lg transition-all cursor-pointer bg-transparent" title="Edit your review">
                          <HiPencil />
                        </button>
                        <button onClick={() => handleDeleteReview(review._id)} className="p-1.5 text-error hover:bg-white/10 border border-transparent hover:border-white/10 rounded-lg transition-all cursor-pointer bg-transparent" title="Delete your review">
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
                      <div key={i} onClick={() => openLightbox(review.images, i)} className="relative group cursor-zoom-in">
                        <img src={img} alt="Review attachment" className="w-20 h-20 rounded-xl object-cover border border-white/10 group-hover:border-primary transition-all" />
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
