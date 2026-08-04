import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const GUEST_CART_KEY = 'dudez_shop_guest_cart';

const getGuestCart = () => {
  try { return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || []; }
  catch { return []; }
};

const saveGuestCart = (items) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const { token, user } = useAuth();

  // When user logs in, merge guest cart into server cart
  useEffect(() => {
    if (token && user) {
      mergeAndFetch();
    } else if (!token) {
      // Load guest cart from localStorage
      loadGuestCart();
    }
  }, [token, user]);

  const loadGuestCart = async () => {
    const guestItems = getGuestCart();
    if (guestItems.length === 0) { setCart({ items: [] }); return; }
    // Fetch product details for guest cart items
    try {
      const enriched = [];
      for (const gi of guestItems) {
        try {
          const res = await API.get(`/products/${gi.productId}`);
          enriched.push({ product: res.data, quantity: gi.quantity });
        } catch {}
      }
      setCart({ items: enriched });
    } catch {
      setCart({ items: [] });
    }
  };

  const mergeAndFetch = async () => {
    try {
      setLoading(true);
      const guestItems = getGuestCart();
      // Merge guest cart items into server
      for (const gi of guestItems) {
        try { await API.post('/cart', { productId: gi.productId, quantity: gi.quantity }); } catch {}
      }
      localStorage.removeItem(GUEST_CART_KEY);
      // Fetch server cart
      const res = await API.get('/cart');
      setCart(res.data);
    } catch (err) {
      console.error('Merge cart error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    if (!token) { loadGuestCart(); return; }
    try {
      setLoading(true);
      const res = await API.get('/cart');
      setCart(res.data);
    } catch (err) { console.error('Fetch cart error:', err); }
    finally { setLoading(false); }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!token) {
      // Guest cart
      const guestItems = getGuestCart();
      const existing = guestItems.find(i => i.productId === productId);
      if (existing) existing.quantity += quantity;
      else guestItems.push({ productId, quantity });
      saveGuestCart(guestItems);
      await loadGuestCart();
      return;
    }
    const res = await API.post('/cart', { productId, quantity });
    setCart(res.data);
    return res.data;
  };

  const updateQuantity = async (productId, quantity) => {
    if (!token) {
      const guestItems = getGuestCart();
      const item = guestItems.find(i => i.productId === productId);
      if (item) item.quantity = quantity;
      saveGuestCart(guestItems);
      await loadGuestCart();
      return;
    }
    const res = await API.put(`/cart/${productId}`, { quantity });
    setCart(res.data);
    return res.data;
  };

  const removeFromCart = async (productId) => {
    if (!token) {
      const guestItems = getGuestCart().filter(i => i.productId !== productId);
      saveGuestCart(guestItems);
      await loadGuestCart();
      return;
    }
    const res = await API.delete(`/cart/${productId}`);
    setCart(res.data);
    return res.data;
  };

  const clearCart = async () => {
    if (!token) {
      localStorage.removeItem(GUEST_CART_KEY);
      setCart({ items: [] });
      return;
    }
    try {
      await API.delete('/cart');
    } catch { /* Cart may already be cleared by backend — ignore */ }
    setCart({ items: [] });
  };

  const cartCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const cartTotal = cart.items?.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, cartTotal, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}
