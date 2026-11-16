import { beforeEach, describe, expect, it } from 'vitest';
import {
  CART_STORAGE_KEY,
  loadCart,
  saveCart,
} from './cartStorage';

const shirt = {
  id: 1,
  title: 'Classic Cotton Shirt',
  price: 25,
  thumbnail: 'shirt.jpg',
  brand: 'Basics',
  category: 'mens-shirts',
  stock: 5,
  quantity: 2,
};

describe('cart storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('round-trips valid cart items', () => {
    saveCart([shirt]);

    expect(loadCart()).toEqual([shirt]);
  });

  it('returns an empty cart when nothing is stored', () => {
    expect(loadCart()).toEqual([]);
  });

  it('ignores invalid JSON and non-array payloads', () => {
    window.localStorage.setItem(CART_STORAGE_KEY, '{not json');
    expect(loadCart()).toEqual([]);

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ shirt }));
    expect(loadCart()).toEqual([]);
  });

  it('drops invalid entries and duplicate ids', () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        shirt,
        { ...shirt, title: '' },
        { ...shirt, price: 'free' },
        { ...shirt, stock: 0 },
        { ...shirt, quantity: 0 },
        { ...shirt, id: 1, quantity: 4 },
      ]),
    );

    expect(loadCart()).toEqual([{ ...shirt, quantity: 4 }]);
  });

  it('clamps a stored quantity to the available stock', () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ ...shirt, quantity: 99 }]),
    );

    expect(loadCart()[0].quantity).toBe(5);
  });
});
