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

const DETAIL_SELECT = [
  'id',
  'title',
  'description',
  'price',
  'discountPercentage',
  'rating',
  'stock',
  'brand',
  'category',
  'tags',
  'thumbnail',
  'images',
  'sku',
  'warrantyInformation',
  'shippingInformation',
  'returnPolicy',
  'meta',
].join(',');

async function request(path) {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    const error = new Error(
      `Product API request failed (${response.status} ${response.statusText})`,
    );
    error.status = response.status;
    throw error;
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

/**
 * Loads one product with the extra fields a detail page needs (description,
 * gallery, delivery information). The category whitelist is enforced here too,
 * so a hand-typed URL cannot pull an unrelated product into the storefront.
 */
export async function getProductById(id) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('A valid product id is required.');
  }

  const select = encodeURIComponent(DETAIL_SELECT);
  const product = await request(`/products/${id}?select=${select}`);

  if (!product || product.id !== id) {
    throw new Error('The product API returned an unexpected response.');
  }

  if (!FASHION_CATEGORIES.includes(product.category)) {
    throw new Error('This product is not part of the storefront catalogue.');
  }

  const images = Array.isArray(product.images) ? product.images : [];

  return {
    ...normalizeProduct(product),
    description: product.description ?? '',
    images:
      images.length > 0
        ? images
        : [product.thumbnail].filter(Boolean),
    discountPercentage: Number(product.discountPercentage) || 0,
    sku: product.sku ?? null,
    warrantyInformation: product.warrantyInformation ?? null,
    shippingInformation: product.shippingInformation ?? null,
    returnPolicy: product.returnPolicy ?? null,
  };
}
