import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productSlice';
import cartReducer, { replaceCart, selectCartItems } from './cartSlice';
import newsletterReducer from './newsLetterSlice';
import authReducer, { initializeAuth } from './authSlice';
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
    auth: { token: getStoredToken(), user: null, status: 'idle', error: null },
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

// Hydrate from server-backed cart when enabled; falls back to local cache.
void cartRepository.load().then((items) => {
  if (!Array.isArray(items)) return;

  const current = selectCartItems(store.getState());
  const same =
    current.length === items.length &&
    JSON.stringify(current) === JSON.stringify(items);

  if (!same) {
    store.dispatch(replaceCart(items));
    lastCartItems = selectCartItems(store.getState());
  }
});

void store.dispatch(initializeAuth());
