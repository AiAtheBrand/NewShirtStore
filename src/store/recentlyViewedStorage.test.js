import { beforeEach, describe, expect, it } from 'vitest';
import {
  RECENTLY_VIEWED_KEY,
  loadRecentlyViewed,
  trackRecentlyViewed,
} from './recentlyViewedStorage';

const shirt = {
  id: 1,
  title: 'Classic Cotton Shirt',
  price: 25,
  thumbnail: 'shirt.jpg',
  brand: 'Basics',
  category: 'mens-shirts',
  rating: 4.5,
  stock: 5,
};

describe('recently viewed storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('tracks a product and moves it to the front on repeat views', () => {
    trackRecentlyViewed(shirt);
    trackRecentlyViewed({ ...shirt, id: 2, title: 'Dress' });
    const items = trackRecentlyViewed(shirt);

    expect(items.map((item) => item.id)).toEqual([1, 2]);
  });

  it('ignores invalid stored data', () => {
    window.localStorage.setItem(RECENTLY_VIEWED_KEY, '{bad');
    expect(loadRecentlyViewed()).toEqual([]);
  });
});
