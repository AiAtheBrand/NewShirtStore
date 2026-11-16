export const CART_STORAGE_KEY = 'shirtstore.cart.v1';

/**
 * Persisted values come from the browser, which means they can be edited or
 * corrupted. Every item is validated and clamped before it reaches Redux.
 */
function normalizeItem(item) {
  if (!item || typeof item !== 'object') return null;

  const id = Number(item.id);
  const title = typeof item.title === 'string' ? item.title.trim() : '';
  const price = Number(item.price);
  const stock = Number(item.stock);
  const quantity = Math.trunc(Number(item.quantity));

  if (!Number.isInteger(id) || id <= 0) return null;
  if (!title) return null;
  if (!Number.isFinite(price) || price < 0) return null;
  if (!Number.isFinite(stock) || stock <= 0) return null;
  if (!Number.isInteger(quantity) || quantity < 1) return null;

  return {
    id,
    title,
    price,
    thumbnail: typeof item.thumbnail === 'string' ? item.thumbnail : '',
    brand: typeof item.brand === 'string' ? item.brand : null,
    category: typeof item.category === 'string' ? item.category : '',
    stock,
    quantity: Math.min(quantity, stock),
  };
}

function getStorage() {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    // Accessing localStorage can throw when storage is blocked.
    return null;
  }
}

export function loadCart() {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const byId = new Map();

    for (const item of parsed) {
      const normalized = normalizeItem(item);
      if (normalized) byId.set(normalized.id, normalized);
    }

    return Array.from(byId.values());
  } catch {
    return [];
  }
}

export function saveCart(items) {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // A full or blocked storage should never break the cart UI.
  }
}
