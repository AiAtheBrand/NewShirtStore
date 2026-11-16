import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/productApi', () => ({
  getCatalogue: vi.fn(),
  getProductById: vi.fn(),
  FASHION_CATEGORIES: [],
}));

import { getCatalogue, getProductById } from '../api/productApi';
import productReducer, {
  fetchCatalogue,
  fetchProductById,
  selectCatalogueError,
  selectCatalogueItems,
  selectCatalogueStatus,
  selectCategories,
  selectCategorySlugs,
  selectProductDetail,
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

  it('loads a product detail', async () => {
    const detail = {
      ...sampleProducts[0],
      description: 'A well-made shirt.',
      images: ['shirt.jpg', 'shirt-2.jpg'],
      discountPercentage: 10,
      sku: 'SKU-1',
    };

    getProductById.mockResolvedValueOnce(detail);
    const store = createTestStore();

    await store.dispatch(fetchProductById(1));

    const { detail: detailState } = store.getState().products;

    expect(getProductById).toHaveBeenCalledWith(1);
    expect(detailState.status).toBe('succeeded');
    expect(detailState.item).toEqual(detail);
    expect(detailState.requestedId).toBe(1);
    expect(selectProductDetail(store.getState()).item.sku).toBe('SKU-1');
  });

  it('reuses a cached product detail for the same id', async () => {
    getProductById.mockResolvedValueOnce(sampleProducts[0]);
    const store = createTestStore();

    await store.dispatch(fetchProductById(1));
    await store.dispatch(fetchProductById(1));

    expect(getProductById).toHaveBeenCalledTimes(1);
  });

  it('stores a detail error and allows a retry', async () => {
    getProductById
      .mockRejectedValueOnce(new Error('Product API request failed (404 Not Found)'))
      .mockResolvedValueOnce(sampleProducts[0]);

    const store = createTestStore();

    await store.dispatch(fetchProductById(1));

    expect(selectProductDetail(store.getState()).status).toBe('failed');
    expect(selectProductDetail(store.getState()).error).toContain('404');

    await store.dispatch(fetchProductById(1));

    expect(getProductById).toHaveBeenCalledTimes(2);
    expect(selectProductDetail(store.getState()).status).toBe('succeeded');
  });
});
