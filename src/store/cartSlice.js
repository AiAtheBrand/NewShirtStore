import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

function getStockLimit(stock) {
  const parsedStock = Number(stock);

  if (Number.isFinite(parsedStock)) {
    return Math.max(0, parsedStock);
  }

  // A missing stock field is treated as unlimited; an explicit 0 means the
  // product cannot be added to the cart.
  return Number.POSITIVE_INFINITY;
}

/**
 * Only the fields the cart needs are copied into the cart. This keeps cart
 * items small, avoids accidentally persisting the full API payload, and keeps
 * totals independent from future API response changes.
 */
function toCartItem(product, quantity = 1) {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    thumbnail: product.thumbnail,
    brand: product.brand ?? null,
    category: product.category,
    stock: product.stock,
    quantity,
  };
}

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

  state.items.push(toCartItem(product, Math.min(requested, stockLimit)));
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
  },
});

export const {
  addToCart,
  addToCartQuantity,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;

export const selectCartCount = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartSubtotal = (state) => {
  const total = state.cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Prices are decimal values from the API; round once at the end so
  // floating-point noise never reaches the UI.
  return Math.round(total * 100) / 100;
};

export const selectCartQuantityById = (state, productId) =>
  state.cart.items.find((item) => item.id === productId)?.quantity ?? 0;

export default cartSlice.reducer;
