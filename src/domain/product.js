/**
 * Business configuration for the curated storefront. This is not product data:
 * every item shown still comes from the data source.
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

export const CATALOGUE_SELECT = [
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

export const DETAIL_SELECT = [
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

export function normalizeCatalogueProduct(product) {
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

export function normalizeProductDetail(product) {
  const images = Array.isArray(product.images) ? product.images : [];

  return {
    ...normalizeCatalogueProduct(product),
    description: product.description ?? '',
    images:
      images.length > 0 ? images : [product.thumbnail].filter(Boolean),
    discountPercentage: Number(product.discountPercentage) || 0,
    sku: product.sku ?? null,
    warrantyInformation: product.warrantyInformation ?? null,
    shippingInformation: product.shippingInformation ?? null,
    returnPolicy: product.returnPolicy ?? null,
  };
}

export function isFashionCategory(category) {
  return FASHION_CATEGORIES.includes(category);
}
