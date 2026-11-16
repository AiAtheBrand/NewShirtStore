import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import Pagination from '../components/Pagination';
import ProductCard from '../components/ProductCard';
import ProductGridSkeleton from '../components/ProductGridSkeleton';
import { useCatalogue } from '../hooks/useCatalogue';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { selectCategories } from '../store/productSlice';
import {
  PAGE_SIZE,
  PRICE_OPTIONS,
  SORT_OPTIONS,
  filterProducts,
  formatCategoryLabel,
  paginateItems,
  parsePriceRange,
  parseSort,
  sortProducts,
} from '../utils/catalogue';

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, isLoading, isError, error, retry } = useCatalogue();
  const categories = useSelector(selectCategories);

  const query = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const price = parsePriceRange(searchParams.get('price') ?? '');
  const sort = parseSort(searchParams.get('sort') ?? '');
  const requestedPage = Number.parseInt(searchParams.get('page') ?? '1', 10);

  useDocumentTitle(
    category
      ? `${formatCategoryLabel(category)} — ShirtStore`
      : 'Shop all products — ShirtStore',
  );

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(patch)) {
      if (!value || (key === 'page' && value === '1')) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }

    // Any change other than an explicit page change starts again at page 1.
    if (!('page' in patch)) next.delete('page');

    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const filtered = useMemo(
    () => filterProducts(items, { query, category, price }),
    [items, query, category, price],
  );

  const sorted = useMemo(
    () => sortProducts(filtered, sort),
    [filtered, sort],
  );

  const {
    items: pageItems,
    page,
    pageCount,
    total,
  } = useMemo(
    () => paginateItems(sorted, requestedPage),
    [sorted, requestedPage],
  );

  const hasFilters = Boolean(query || category || price || sort !== 'featured');
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = rangeStart === 0 ? 0 : rangeStart + pageItems.length - 1;

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 md:px-10 lg:px-16">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-black tracking-tight md:text-5xl">
          {category ? formatCategoryLabel(category) : 'ALL PRODUCTS'}
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          Browse the curated fashion catalogue. Filter by category or price,
          search by name, and sort the results — all without leaving the page.
        </p>
      </header>

      <section
        aria-label="Catalogue filters"
        className="mt-8 rounded-2xl border border-gray-200 p-5 md:p-6"
      >
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div>
            <label
              htmlFor="catalogue-search"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500"
            >
              Search
            </label>

            <input
              id="catalogue-search"
              type="search"
              value={query}
              onChange={(event) => updateParams({ q: event.target.value })}
              placeholder="Search by name, brand or tag"
              autoComplete="off"
              className="w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="price-filter"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500"
            >
              Price
            </label>

            <select
              id="price-filter"
              value={price}
              onChange={(event) => updateParams({ price: event.target.value })}
              className="w-full rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
            >
              {PRICE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="sort-filter"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500"
            >
              Sort by
            </label>

            <select
              id="sort-filter"
              value={sort}
              onChange={(event) => updateParams({ sort: event.target.value })}
              className="w-full rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => updateParams({ category: '' })}
            aria-pressed={category === ''}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium transition hover:border-black aria-pressed:border-black aria-pressed:bg-black aria-pressed:text-white"
          >
            All
          </button>

          {categories.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => updateParams({ category: item.slug })}
              aria-pressed={category === item.slug}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium transition hover:border-black aria-pressed:border-black aria-pressed:bg-black aria-pressed:text-white"
            >
              {formatCategoryLabel(item.slug)}
            </button>
          ))}

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto text-sm font-semibold underline underline-offset-4 transition hover:text-gray-600"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {isError ? (
        <div className="mt-12 rounded-2xl border border-gray-200 p-10 text-center">
          <h2 className="text-xl font-bold">The catalogue could not load.</h2>
          <p className="mt-2 text-sm text-gray-500">{error}</p>

          <button
            type="button"
            onClick={retry}
            className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Try again
          </button>
        </div>
      ) : isLoading ? (
        <div className="mt-10">
          <ProductGridSkeleton count={PAGE_SIZE} />
        </div>
      ) : total === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-gray-300 p-10 text-center">
          <h2 className="text-xl font-bold">No products match your filters.</h2>
          <p className="mt-2 text-sm text-gray-500">
            Try a different search term, category or price range.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm text-gray-500">
            Showing {rangeStart}–{rangeEnd} of {total}{' '}
            {total === 1 ? 'product' : 'products'}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {pageItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <Pagination
            page={page}
            pageCount={pageCount}
            onChange={(nextPage) => updateParams({ page: String(nextPage) })}
          />
        </>
      )}
    </main>
  );
}

export default Products;
