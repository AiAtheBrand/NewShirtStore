export const PAGE_SIZE = 12;

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Top Rated' },
  { value: 'name-asc', label: 'Name: A–Z' },
];

export const PRICE_OPTIONS = [
  { value: '', label: 'Any price' },
  { value: 'under-30', label: 'Under $30' },
  { value: '30-60', label: '$30 – $60' },
  { value: 'over-60', label: 'Over $60' },
];

const SORT_VALUES = new Set(SORT_OPTIONS.map((option) => option.value));
const PRICE_VALUES = new Set(
  PRICE_OPTIONS.map((option) => option.value).filter(Boolean),
);

const GENDER_LABELS = {
  mens: "Men's",
  womens: "Women's",
};

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Turns an API category slug into a human label without keeping a second
 * hardcoded list of category names in the UI.
 * mens-shirts -> "Men's Shirts", tops -> "Tops"
 */
export function formatCategoryLabel(slug = '') {
  const [first, ...rest] = slug.split('-').filter(Boolean);
  if (!first) return '';

  const head = GENDER_LABELS[first] ?? capitalize(first);
  return [head, ...rest.map(capitalize)].join(' ');
}

export function parseSort(value) {
  return SORT_VALUES.has(value) ? value : 'featured';
}

export function parsePriceRange(value) {
  return PRICE_VALUES.has(value) ? value : '';
}

export function matchesPriceRange(price, range) {
  const amount = Number(price);

  switch (range) {
    case 'under-30':
      return amount < 30;
    case '30-60':
      return amount >= 30 && amount < 60;
    case 'over-60':
      return amount >= 60;
    default:
      return true;
  }
}

export function filterProducts(
  products,
  { query = '', category = '', price = '' } = {},
) {
  const normalizedQuery = query.trim().toLowerCase();
  const range = parsePriceRange(price);

  return products.filter((product) => {
    if (category && product.category !== category) {
      return false;
    }

    if (!matchesPriceRange(product.price, range)) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableText = [
      product.title,
      product.brand,
      product.category,
      ...(product.tags ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

export function sortProducts(products, sort = 'featured') {
  const sorted = [...products];

  switch (parseSort(sort)) {
    case 'newest':
      return sorted.sort((a, b) => {
        const dateDifference =
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime();
        return dateDifference || b.id - a.id;
      });
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating-desc':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'name-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'featured':
    default:
      return sorted;
  }
}

export function getPageCount(totalItems, pageSize = PAGE_SIZE) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function paginateItems(items, requestedPage, pageSize = PAGE_SIZE) {
  const pageCount = getPageCount(items.length, pageSize);
  const parsedPage = Number(requestedPage);
  const page = Math.min(
    Math.max(Number.isFinite(parsedPage) ? Math.trunc(parsedPage) : 1, 1),
    pageCount,
  );
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page,
    pageCount,
    total: items.length,
  };
}
