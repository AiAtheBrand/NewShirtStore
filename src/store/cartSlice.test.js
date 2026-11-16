import { describe, expect, it } from 'vitest';
import cartReducer, {
  addToCart,
  addToCartQuantity,
  clearCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  selectCartCount,
  selectCartItems,
  selectCartSubtotal,
} from './cartSlice';

const shirt = {
  id: 1,
  title: 'Classic Cotton Shirt',
  price: 25,
  thumbnail: 'shirt.jpg',
  brand: 'Basics',
  category: 'mens-shirts',
  stock: 2,
};

const emptyState = cartReducer(undefined, { type: '@@init' });

function reduce(state, action) {
  return cartReducer(state, action);
}

function asStoreState(cartState) {
  return { cart: cartState };
}

describe('cartSlice', () => {
  it('adds a product with the fields the cart needs', () => {
    const state = reduce(emptyState, addToCart(shirt));

    expect(state.items).toEqual([
      {
        id: 1,
        title: 'Classic Cotton Shirt',
        price: 25,
        thumbnail: 'shirt.jpg',
        brand: 'Basics',
        category: 'mens-shirts',
        stock: 2,
        quantity: 1,
      },
    ]);
  });

  it('increments an existing item instead of duplicating it', () => {
    let state = reduce(emptyState, addToCart(shirt));
    state = reduce(state, addToCart(shirt));

    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it('never adds more than the available stock', () => {
    let state = reduce(emptyState, addToCart(shirt));
    state = reduce(state, addToCart(shirt));
    state = reduce(state, addToCart(shirt));

    expect(state.items[0].quantity).toBe(2);
  });

  it('refuses out-of-stock products', () => {
    const state = reduce(emptyState, addToCart({ ...shirt, stock: 0 }));

    expect(state.items).toEqual([]);
  });

  it('adds a chosen quantity and clamps it to stock', () => {
    let state = reduce(
      emptyState,
      addToCartQuantity({ product: shirt, quantity: 3 }),
    );
    expect(state.items[0].quantity).toBe(2);

    state = reduce(emptyState, addToCartQuantity({ product: { ...shirt, stock: 9 }, quantity: 4 }));
    expect(state.items[0].quantity).toBe(4);
  });

  it('ignores an invalid quantity payload', () => {
    const state = reduce(emptyState, addToCartQuantity(undefined));

    expect(state.items).toEqual([]);
  });

  it('increases and decreases quantity within bounds', () => {
    let state = reduce(emptyState, addToCart(shirt));

    state = reduce(state, increaseQuantity(1));
    expect(state.items[0].quantity).toBe(2);

    state = reduce(state, increaseQuantity(1));
    expect(state.items[0].quantity).toBe(2);

    state = reduce(state, decreaseQuantity(1));
    expect(state.items[0].quantity).toBe(1);

    state = reduce(state, decreaseQuantity(1));
    expect(state.items[0].quantity).toBe(1);
  });

  it('removes and clears items', () => {
    let state = reduce(emptyState, addToCart(shirt));
    state = reduce(state, removeFromCart(1));
    expect(state.items).toEqual([]);

    state = reduce(state, addToCart(shirt));
    state = reduce(state, clearCart());
    expect(state.items).toEqual([]);
  });

  it('exposes count and a rounded subtotal selector', () => {
    let state = reduce(emptyState, addToCart({ ...shirt, price: 19.99 }));
    state = reduce(state, addToCart({ ...shirt, price: 19.99 }));

    const storeState = asStoreState(state);

    expect(selectCartItems(storeState)).toHaveLength(1);
    expect(selectCartCount(storeState)).toBe(2);
    expect(selectCartSubtotal(storeState)).toBe(39.98);
  });

  it('returns zero totals for an empty cart', () => {
    const storeState = asStoreState(emptyState);

    expect(selectCartCount(storeState)).toBe(0);
    expect(selectCartSubtotal(storeState)).toBe(0);
  });
});
