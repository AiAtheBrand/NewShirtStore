import { normalizePersistedCartItem } from '../domain/cart';

export const CART_STORAGE_KEY = 'shirtstore.cart.v1';

function getStorage() {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    // Accessing localStorage can throw when storage is blocked.
    return null;
  }
}

/**
 * Local-storage cart repository. This is the current fallback persistence
 * strategy; a future backend can replace these functions with API-backed
 * cart/session calls while keeping the rest of the UI stable.
 */
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
      const normalized = normalizePersistedCartItem(item);
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

export function clearPersistedCart() {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(CART_STORAGE_KEY);
  } catch {
    // Ignore storage access failures.
  }
}
