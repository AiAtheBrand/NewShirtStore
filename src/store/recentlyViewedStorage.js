export const RECENTLY_VIEWED_KEY = 'shirtstore.recentlyViewed.v1';
export const RECENTLY_VIEWED_LIMIT = 8;

const EMPTY = [];
let cachedRaw;
let cachedItems = EMPTY;

function getStorage() {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function toSnapshot(product) {
  if (!product || typeof product !== 'object') return null;

  const id = Number(product.id);
  if (!Number.isInteger(id) || id <= 0) return null;

  const title = typeof product.title === 'string' ? product.title.trim() : '';
  if (!title) return null;

  return {
    id,
    title,
    price: Number(product.price) || 0,
    thumbnail: typeof product.thumbnail === 'string' ? product.thumbnail : '',
    brand: typeof product.brand === 'string' ? product.brand : null,
    category: typeof product.category === 'string' ? product.category : '',
    rating: Number(product.rating) || 0,
    stock: Number.isFinite(Number(product.stock)) ? Number(product.stock) : 0,
  };
}

function normalize(raw) {
  if (!raw) return EMPTY;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;

    const byId = new Map();
    for (const item of parsed) {
      const snapshot = toSnapshot(item);
      if (snapshot && !byId.has(snapshot.id)) byId.set(snapshot.id, snapshot);
    }

    const items = Array.from(byId.values()).slice(0, RECENTLY_VIEWED_LIMIT);
    return items.length === 0 ? EMPTY : items;
  } catch {
    return EMPTY;
  }
}

export function loadRecentlyViewed() {
  const storage = getStorage();
  if (!storage) return EMPTY;

  const raw = storage.getItem(RECENTLY_VIEWED_KEY);
  if (raw === cachedRaw) return cachedItems;

  cachedRaw = raw;
  cachedItems = normalize(raw);
  return cachedItems;
}

export function saveRecentlyViewed(items) {
  const storage = getStorage();
  if (!storage) return;

  const next = (items ?? []).slice(0, RECENTLY_VIEWED_LIMIT);
  const raw = JSON.stringify(next);

  try {
    storage.setItem(RECENTLY_VIEWED_KEY, raw);
    cachedRaw = raw;
    cachedItems = next.length === 0 ? EMPTY : next;
  } catch {
    // Ignore storage access/write failures.
  }
}

export function trackRecentlyViewed(product) {
  const snapshot = toSnapshot(product);
  if (!snapshot) return loadRecentlyViewed();

  const current = loadRecentlyViewed().filter((item) => item.id !== snapshot.id);
  const next = [snapshot, ...current].slice(0, RECENTLY_VIEWED_LIMIT);
  saveRecentlyViewed(next);
  return next;
}
