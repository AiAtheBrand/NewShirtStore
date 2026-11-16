import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productSlice';
import cartReducer, { selectCartItems } from './cartSlice';
import newsletterReducer from './newsLetterSlice';
import { loadCart, saveCart } from './cartStorage';

export const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    newsletter: newsletterReducer,
  },
  preloadedState: {
    cart: { items: loadCart() },
  },
});

// Write to storage only when the cart changed, not on every action.
let lastCartItems = selectCartItems(store.getState());

store.subscribe(() => {
  const cartItems = selectCartItems(store.getState());

  if (cartItems !== lastCartItems) {
    lastCartItems = cartItems;
    saveCart(cartItems);
  }
});
