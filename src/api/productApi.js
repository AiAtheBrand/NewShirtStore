/**
 * Compatibility layer for product data access.
 *
 * The implementation now lives behind domain/service modules so a future backend
 * can replace the data source with minimal changes to slices and UI.
 */
export { FASHION_CATEGORIES, getCatalogue, getProductById } from '../services/productService';
