import { apiRequest } from './apiClient';
import { clearPersistedCart, loadCart, saveCart } from '../store/cartStorage';

const CART_SESSION_KEY = 'shirtstore.cartSession.v1';

export function getCartSessionId() {
  return getOrCreateSessionId();
}

function isCartApiEnabled() {
  return import.meta.env.VITE_CART_API_ENABLED === 'true';
}

function getOrCreateSessionId() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    let id = window.localStorage.getItem(CART_SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `cart_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      window.localStorage.setItem(CART_SESSION_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

async function requestCart(path, options = {}) {
  const sessionId = getOrCreateSessionId();
  if (!sessionId) throw new Error('Cart session unavailable.');

  return apiRequest(path, {
    ...options,
    headers: {
      'X-Cart-Session': sessionId,
      ...options.headers,
    },
  });
}

/**
 * Cart persistence boundary.
 *
 * Uses server-backed /cart when VITE_CART_API_ENABLED=true, with localStorage
 * fallback/cache for resilience and offline use.
 */
export const cartRepository = {
  async load() {
    if (!isCartApiEnabled()) return loadCart();

    try {
      const data = await requestCart('/cart');
      const items = Array.isArray(data?.items) ? data.items : [];
      saveCart(items);
      return items;
    } catch {
      return loadCart();
    }
  },

  async save(items) {
    saveCart(items);
    if (!isCartApiEnabled()) return;

    try {
      await requestCart('/cart', {
        method: 'PUT',
        body: JSON.stringify({ items }),
      });
    } catch {
      // Keep local cache when server sync fails.
    }
  },

  async clear() {
    clearPersistedCart();
    if (!isCartApiEnabled()) return;

    try {
      await requestCart('/cart', { method: 'DELETE' });
    } catch {
      // Ignore server clear failures; local cart is already cleared.
    }
  },

  async merge(items = []) {
    if (!isCartApiEnabled()) return Array.isArray(items) ? items : [];
    const sessionId = getOrCreateSessionId();
    try {
      const data = await apiRequest('/cart/merge', {
        method: 'POST',
        headers: sessionId ? { 'X-Cart-Session': sessionId } : undefined,
        body: JSON.stringify({ items }),
      });
      const merged = Array.isArray(data?.items) ? data.items : [];
      saveCart(merged);
      return merged;
    } catch {
      return loadCart();
    }
  },
};
