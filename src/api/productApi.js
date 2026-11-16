const API_URL = import.meta.env.VITE_API_URL ?? 'https://dummyjson.com';

/**
 * The product API is not a clothing-only API, so the storefront deliberately
 * curates a fashion scope. This is business configuration, not product data:
 * every product shown still comes from the API.
 */
export const FASHION_CATEGORIES = [
  'mens-shirts',
  'womens-dresses',
  'tops',
  'mens-shoes',
  'womens-shoes',
  'womens-bags',
  'sunglasses',
];

const CATALOGUE_SELECT = [
  'id',
  'title',
  'price',
  'discountPercentage',
  'rating',
  'stock',
  'brand',
  'category',
  'tags',
  'thumbnail',
  'meta',
].join(',');

async function request(path) {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(
      `Product API request failed (${response.status} ${response.statusText})`,
    );
  }

  return response.json();
}

/**
 * Converts an API record into the small, predictable shape the UI and cart
 * use. Keeping this mapping in one place means components never depend on
 * DummyJSON's full payload (reviews, dimensions, metadata, ...).
 */
function normalizeProduct(product) {
  return {
    id: product.id,
    title: product.title,
    price: Number(product.price) || 0,
    rating: Number(product.rating) || 0,
    stock: Number(product.stock) || 0,
    brand: product.brand || null,
    category: product.category,
    tags: Array.isArray(product.tags) ? product.tags : [],
    thumbnail: product.thumbnail,
    createdAt: product.meta?.createdAt ?? null,
  };
}

export async function getCatalogue() {
  const select = encodeURIComponent(CATALOGUE_SELECT);
  const data = await request(`/products?limit=0&select=${select}`);

  if (!Array.isArray(data.products)) {
    throw new Error('The product API returned an unexpected response.');
  }

  return data.products
    .filter((product) => FASHION_CATEGORIES.includes(product.category))
    .map(normalizeProduct);
}
