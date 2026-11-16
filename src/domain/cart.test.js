import { describe, expect, it } from 'vitest';
import {
  calculateCartCount,
  calculateCartSubtotal,
  normalizePersistedCartItem,
  toCartLineItem,
} from './cart';

describe('cart domain', () => {
  it('maps a product to a cart line item and clamps quantity to stock', () => {
    expect(
      toCartLineItem(
        { id: 1, title: 'Shirt', price: 25, thumbnail: 'a.jpg', brand: null, category: 'tops', stock: 2 },
        5,
      ),
    ).toEqual({
      id: 1,
      title: 'Shirt',
      price: 25,
      thumbnail: 'a.jpg',
      brand: null,
      category: 'tops',
      stock: 2,
      quantity: 2,
    });
  });

  it('normalizes persisted items and rejects invalid entries', () => {
    expect(
      normalizePersistedCartItem({ id: 1, title: 'Shirt', price: 25, stock: 5, quantity: 9 }),
    ).toMatchObject({ id: 1, quantity: 5 });
    expect(normalizePersistedCartItem({ id: 1, title: '', price: 25, stock: 5, quantity: 1 })).toBeNull();
  });

  it('calculates totals from items', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5.5, quantity: 1 },
    ];
    expect(calculateCartCount(items)).toBe(3);
    expect(calculateCartSubtotal(items)).toBe(25.5);
  });
});
