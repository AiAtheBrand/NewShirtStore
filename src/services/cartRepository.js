import { clearPersistedCart, loadCart, saveCart } from '../store/cartStorage';

/**
 * Cart persistence boundary.
 *
 * Current implementation is localStorage-backed for demo/offline use.
 * A future backend can replace these methods with authenticated/session cart
 * API calls while keeping store/UI consumers stable.
 */
export const cartRepository = {
  async load() {
    return loadCart();
  },

  async save(items) {
    saveCart(items);
  },

  async clear() {
    clearPersistedCart();
  },
};
