import { describe, expect, it } from 'vitest';
import {
  filterProducts,
  formatCategoryLabel,
  getPageCount,
  paginateItems,
  parsePriceRange,
  parseSort,
  sortProducts,
} from './catalogue';

const products = [
  {
    id: 1,
    title: 'Classic Cotton Shirt',
    brand: 'Basics',
    category: 'mens-shirts',
    price: 25,
    rating: 4.2,
    tags: ['cotton'],
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    title: 'Summer Dress',
    brand: 'Bloom',
    category: 'womens-dresses',
    price: 45,
    rating: 4.9,
    tags: ['summer', 'floral'],
    createdAt: '2025-06-01T00:00:00.000Z',
  },
  {
    id: 3,
    title: 'Leather Bag',
    brand: 'Carry',
    category: 'womens-bags',
    price: 75,
    rating: 4.5,
    tags: ['leather'],
    createdAt: '2024-12-01T00:00:00.000Z',
  },
];

describe('formatCategoryLabel', () => {
  it('turns API slugs into readable labels', () => {
    expect(formatCategoryLabel('mens-shirts')).toBe("Men's Shirts");
    expect(formatCategoryLabel('womens-dresses')).toBe("Women's Dresses");
    expect(formatCategoryLabel('tops')).toBe('Tops');
    expect(formatCategoryLabel('womens-bags')).toBe("Women's Bags");
  });

  it('handles empty input', () => {
    expect(formatCategoryLabel('')).toBe('');
    expect(formatCategoryLabel()).toBe('');
  });
});

describe('parseSort and parsePriceRange', () => {
  it('accepts known values only', () => {
    expect(parseSort('price-asc')).toBe('price-asc');
    expect(parseSort('bogus')).toBe('featured');
    expect(parseSort(null)).toBe('featured');

    expect(parsePriceRange('under-30')).toBe('under-30');
    expect(parsePriceRange('bogus')).toBe('');
    expect(parsePriceRange(undefined)).toBe('');
  });
});

describe('filterProducts', () => {
  it('returns everything when no filters are set', () => {
    expect(filterProducts(products, {})).toHaveLength(3);
  });

  it('filters by category', () => {
    const result = filterProducts(products, { category: 'womens-dresses' });

    expect(result.map((product) => product.id)).toEqual([2]);
  });

  it('filters by price range', () => {
    expect(
      filterProducts(products, { price: 'under-30' }).map((p) => p.id),
    ).toEqual([1]);

    expect(
      filterProducts(products, { price: '30-60' }).map((p) => p.id),
    ).toEqual([2]);

    expect(
      filterProducts(products, { price: 'over-60' }).map((p) => p.id),
    ).toEqual([3]);
  });

  it('searches titles, brands, categories and tags case-insensitively', () => {
    expect(
      filterProducts(products, { query: 'SUMMER' }).map((p) => p.id),
    ).toEqual([2]);

    expect(
      filterProducts(products, { query: 'basics' }).map((p) => p.id),
    ).toEqual([1]);

    expect(
      filterProducts(products, { query: 'womens-bags' }).map((p) => p.id),
    ).toEqual([3]);

    expect(
      filterProducts(products, { query: 'floral' }).map((p) => p.id),
    ).toEqual([2]);
  });

  it('combines filters', () => {
    expect(
      filterProducts(products, {
        category: 'womens-dresses',
        price: 'over-60',
      }),
    ).toEqual([]);
  });
});

describe('sortProducts', () => {
  it('does not mutate the input array', () => {
    const original = [...products];
    sortProducts(products, 'price-asc');

    expect(products).toEqual(original);
  });

  it('sorts by price in both directions', () => {
    expect(
      sortProducts(products, 'price-asc').map((product) => product.id),
    ).toEqual([1, 2, 3]);

    expect(
      sortProducts(products, 'price-desc').map((product) => product.id),
    ).toEqual([3, 2, 1]);
  });

  it('sorts by rating and name', () => {
    expect(
      sortProducts(products, 'rating-desc').map((product) => product.id),
    ).toEqual([2, 3, 1]);

    expect(
      sortProducts(products, 'name-asc').map((product) => product.id),
    ).toEqual([1, 3, 2]);
  });

  it('sorts newest first using createdAt', () => {
    expect(
      sortProducts(products, 'newest').map((product) => product.id),
    ).toEqual([2, 1, 3]);
  });
});

describe('pagination helpers', () => {
  it('never reports fewer than one page', () => {
    expect(getPageCount(0, 12)).toBe(1);
    expect(getPageCount(12, 12)).toBe(1);
    expect(getPageCount(13, 12)).toBe(2);
  });

  it('slices the requested page', () => {
    const items = Array.from({ length: 30 }, (_, index) => index + 1);
    const result = paginateItems(items, 2, 12);

    expect(result.page).toBe(2);
    expect(result.pageCount).toBe(3);
    expect(result.total).toBe(30);
    expect(result.items[0]).toBe(13);
    expect(result.items).toHaveLength(12);
  });

  it('clamps out-of-range and invalid pages', () => {
    const items = Array.from({ length: 30 }, (_, index) => index + 1);

    expect(paginateItems(items, 99, 12).page).toBe(3);
    expect(paginateItems(items, 0, 12).page).toBe(1);
    expect(paginateItems(items, Number.NaN, 12).page).toBe(1);
  });
});
