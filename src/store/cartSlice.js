import { createSlice } from '@reduxjs/toolkit';
import {
  calculateCartCount,
  calculateCartSubtotal,
  getStockLimit,
  toCartLineItem,
} from '../domain/cart';

const initialState = {
  items: [],
};

function addItem(state, product, amount = 1) {
  if (!product) return;

  const stockLimit = getStockLimit(product.stock);
  if (stockLimit <= 0) return;

  const requested = Math.max(1, Math.trunc(Number(amount)) || 1);
  const existingItem = state.items.find((item) => item.id === product.id);

  if (existingItem) {
    const existingStockLimit = getStockLimit(existingItem.stock);
    if (existingStockLimit <= 0) return;

    existingItem.quantity = Math.min(
      existingItem.quantity + requested,
      existingStockLimit,
    );
    return;
  }

  state.items.push(toCartLineItem(product, Math.min(requested, stockLimit)));
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      addItem(state, action.payload, 1);
    },

    addToCartQuantity: (state, action) => {
      const { product, quantity } = action.payload ?? {};
      addItem(state, product, quantity);
    },

    increaseQuantity: (state, action) => {
      const item = state.items.find((entry) => entry.id === action.payload);

      if (!item) return;

      const stockLimit = getStockLimit(item.stock);
      if (stockLimit <= 0) return;

      item.quantity = Math.min(item.quantity + 1, stockLimit);
    },

    decreaseQuantity: (state, action) => {
      const item = state.items.find((entry) => entry.id === action.payload);

      if (!item) return;

      item.quantity = Math.max(1, item.quantity - 1);
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload,
      );
    },

    clearCart: (state) => {
      state.items = [];
    },

    replaceCart: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : [];
    },
  },
});

export const {
  addToCart,
  addToCartQuantity,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  replaceCart,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;

export const selectCartCount = (state) => calculateCartCount(state.cart.items);

export const selectCartSubtotal = (state) =>
  calculateCartSubtotal(state.cart.items);

export const selectCartQuantityById = (state, productId) =>
  state.cart.items.find((item) => item.id === productId)?.quantity ?? 0;

export default cartSlice.reducer;
