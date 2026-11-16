import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productSlice';
import cartReducer, { replaceCart, selectCartItems } from './cartSlice';
import newsletterReducer from './newsLetterSlice';
import authReducer, { initializeAuth, logout } from './authSlice';
import { cartRepository } from '../services/cartRepository';
import { loadCart } from './cartStorage';
import { getStoredToken } from '../services/authService';

export const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    newsletter: newsletterReducer,
    auth: authReducer,
  },
  preloadedState: {
    // Synchronous preload keeps first paint stable; repository remains the
    // persistence boundary for future async/server-backed cart hydration.
    cart: { items: loadCart() },
    auth: {
      token: getStoredToken(),
      user: null,
      status: 'idle',
      error: null,
      initialized: false,
    },
  },
});

// Persist through the cart repository so the storage strategy can be swapped
// (e.g. server-backed cart) without changing slice or UI code.
let lastCartItems = selectCartItems(store.getState());

store.subscribe(() => {
  const cartItems = selectCartItems(store.getState());

  if (cartItems !== lastCartItems) {
    lastCartItems = cartItems;
    void cartRepository.save(cartItems);
  }
});

async function syncCartFromRepository() {
  const items = await cartRepository.load().catch(() => null);
  if (!Array.isArray(items)) return;

  const current = selectCartItems(store.getState());
  const same =
    current.length === items.length &&
    JSON.stringify(current) === JSON.stringify(items);

  if (!same) {
    store.dispatch(replaceCart(items));
    lastCartItems = selectCartItems(store.getState());
  }
}

// Hydrate from server-backed cart when enabled; falls back to local cache.
void syncCartFromRepository();

let lastAuthKey = `${store.getState().auth.token ?? ''}|${store.getState().auth.user?.id ?? ''}`;
store.subscribe(() => {
  const auth = store.getState().auth;
  const key = `${auth.token ?? ''}|${auth.user?.id ?? ''}`;
  if (key !== lastAuthKey) {
    lastAuthKey = key;
    if (auth.initialized) {
      void syncCartFromRepository();
    }
  }
});

if (typeof window !== 'undefined') {
  window.addEventListener('shirtstore:auth-expired', () => {
    store.dispatch(logout());
  });

  window.addEventListener('storage', (event) => {
    if (event.key !== 'shirtstore.authToken.v1') return;
    if (!event.newValue) {
      store.dispatch(logout());
    } else {
      void store.dispatch(initializeAuth());
    }
  });
}

void store.dispatch(initializeAuth());
