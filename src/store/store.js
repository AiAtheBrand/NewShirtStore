import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productSlice';
import cartReducer, { selectCartItems } from './cartSlice';
import newsletterReducer from './newsLetterSlice';
import { cartRepository } from '../services/cartRepository';
import { loadCart } from './cartStorage';

export const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    newsletter: newsletterReducer,
  },
  preloadedState: {
    // Synchronous preload keeps first paint stable; repository remains the
    // persistence boundary for future async/server-backed cart hydration.
    cart: { items: loadCart() },
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
