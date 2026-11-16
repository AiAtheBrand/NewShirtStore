import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/productApi', () => ({
  getCatalogue: vi.fn(),
  FASHION_CATEGORIES: [],
}));

import { getCatalogue } from '../api/productApi';
import productReducer, {
  fetchCatalogue,
  selectCatalogueError,
  selectCatalogueItems,
  selectCatalogueStatus,
  selectCategories,
  selectCategorySlugs,
} from './productSlice';

const sampleProducts = [
  {
    id: 1,
    title: 'Classic Cotton Shirt',
    price: 25,
    rating: 4.2,
    stock: 5,
    brand: 'Basics',
    category: 'mens-shirts',
    tags: ['cotton'],
    thumbnail: 'shirt.jpg',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    title: 'Summer Dress',
    price: 45,
    rating: 4.9,
    stock: 3,
    brand: 'Bloom',
    category: 'womens-dresses',
    tags: ['summer'],
    thumbnail: 'dress.jpg',
    createdAt: '2025-06-01T00:00:00.000Z',
  },
  {
    id: 3,
    title: 'Another Shirt',
    price: 30,
    rating: 4,
    stock: 1,
    brand: 'Basics',
    category: 'mens-shirts',
    tags: ['shirt'],
    thumbnail: 'shirt-2.jpg',
    createdAt: '2025-02-01T00:00:00.000Z',
  },
];

function createTestStore() {
  return configureStore({ reducer: { products: productReducer } });
}

describe('productSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores the catalogue after a successful fetch', async () => {
    getCatalogue.mockResolvedValueOnce(sampleProducts);
    const store = createTestStore();

    await store.dispatch(fetchCatalogue());

    const state = store.getState();

    expect(selectCatalogueStatus(state)).toBe('succeeded');
    expect(selectCatalogueItems(state)).toEqual(sampleProducts);
    expect(selectCatalogueError(state)).toBeNull();
  });

  it('stores a readable error when the request fails', async () => {
    getCatalogue.mockRejectedValueOnce(new Error('Network down'));
    const store = createTestStore();

    await store.dispatch(fetchCatalogue());

    const state = store.getState();

    expect(selectCatalogueStatus(state)).toBe('failed');
    expect(selectCatalogueError(state)).toBe('Network down');
  });

  it('prevents duplicate requests while one is in flight', async () => {
    let resolveRequest;
    getCatalogue.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );

    const store = createTestStore();
    const firstRequest = store.dispatch(fetchCatalogue());
    const secondRequest = store.dispatch(fetchCatalogue());

    expect(getCatalogue).toHaveBeenCalledTimes(1);

    resolveRequest(sampleProducts);
    await firstRequest;
    await secondRequest;

    expect(selectCatalogueStatus(store.getState())).toBe('succeeded');
  });

  it('allows a retry after a failure', async () => {
    getCatalogue
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockResolvedValueOnce(sampleProducts);

    const store = createTestStore();

    await store.dispatch(fetchCatalogue());
    expect(selectCatalogueStatus(store.getState())).toBe('failed');

    await store.dispatch(fetchCatalogue());

    expect(getCatalogue).toHaveBeenCalledTimes(2);
    expect(selectCatalogueStatus(store.getState())).toBe('succeeded');
  });

  it('derives one entry per category with a representative image', () => {
    const state = { products: { items: sampleProducts } };

    expect(selectCategories(state)).toEqual([
      { slug: 'mens-shirts', image: 'shirt.jpg' },
      { slug: 'womens-dresses', image: 'dress.jpg' },
    ]);
    expect(selectCategorySlugs(state)).toEqual([
      'mens-shirts',
      'womens-dresses',
    ]);
  });
});
