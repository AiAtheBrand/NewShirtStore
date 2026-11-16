export function getStockLimit(stock) {
  const parsedStock = Number(stock);

  if (Number.isFinite(parsedStock)) {
    return Math.max(0, parsedStock);
  }

  // A missing stock field is treated as unlimited; an explicit 0 means the
  // product cannot be added to the cart.
  return Number.POSITIVE_INFINITY;
}

export function toCartLineItem(product, quantity = 1) {
  const stockLimit = getStockLimit(product.stock);
  const requested = Math.max(1, Math.trunc(Number(quantity)) || 1);

  return {
    id: product.id,
    title: product.title,
    price: Number(product.price) || 0,
    thumbnail: product.thumbnail ?? '',
    brand: product.brand ?? null,
    category: product.category ?? '',
    stock: Number.isFinite(Number(product.stock))
      ? Number(product.stock)
      : product.stock,
    quantity: Math.min(requested, stockLimit),
  };
}

export function normalizePersistedCartItem(item) {
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

export function calculateCartSubtotal(items) {
  const total = (items ?? []).reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  return Math.round(total * 100) / 100;
}

export function calculateCartCount(items) {
  return (items ?? []).reduce((total, item) => total + Number(item.quantity || 0), 0);
}
