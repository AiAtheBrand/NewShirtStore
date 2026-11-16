import { apiRequest } from './apiClient';
import {
  CATALOGUE_SELECT,
  DETAIL_SELECT,
  FASHION_CATEGORIES,
  isFashionCategory,
  normalizeCatalogueProduct,
  normalizeProductDetail,
} from '../domain/product';

export { FASHION_CATEGORIES };

export async function getCatalogue() {
  const select = encodeURIComponent(CATALOGUE_SELECT);
  const data = await apiRequest(`/products?limit=0&select=${select}`);

  if (!Array.isArray(data.products)) {
    throw new Error('The product API returned an unexpected response.');
  }

  return data.products
    .filter((product) => isFashionCategory(product.category))
    .map(normalizeCatalogueProduct);
}

export async function getProductById(id) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('A valid product id is required.');
  }

  const select = encodeURIComponent(DETAIL_SELECT);
  const product = await apiRequest(`/products/${id}?select=${select}`);

  if (!product || product.id !== id) {
    throw new Error('The product API returned an unexpected response.');
  }

  if (!isFashionCategory(product.category)) {
    throw new Error('This product is not part of the storefront catalogue.');
  }

  return normalizeProductDetail(product);
}
