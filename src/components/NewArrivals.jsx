import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCatalogue } from '../hooks/useCatalogue';
import { sortProducts } from '../utils/catalogue';
import ProductCard from './ProductCard';
import ProductGridSkeleton from './ProductGridSkeleton';

function NewArrivals() {
  const { items, isLoading, isError, error, retry } = useCatalogue();

  const newest = useMemo(
    () => sortProducts(items, 'newest').slice(0, 4),
    [items],
  );

  return (
    <section className="px-6 py-16 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black">NEW ARRIVALS</h2>

          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500">
            The latest additions to the collection, sorted by the date the API
            published them.
          </p>
        </div>

        {isError ? (
          <div className="rounded-2xl border border-gray-200 p-10 text-center">
            <p className="font-semibold">We could not load new arrivals.</p>
            <p className="mt-2 text-sm text-gray-500">{error}</p>

            <button
              type="button"
              onClick={retry}
              className="mt-5 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {newest.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/products?sort=newest"
            className="inline-block rounded-full border border-black px-8 py-3 text-sm font-semibold transition hover:bg-black hover:text-white"
          >
            View all new arrivals
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NewArrivals;
