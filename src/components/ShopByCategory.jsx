import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useCatalogue } from '../hooks/useCatalogue';
import { selectCategories } from '../store/productSlice';
import { formatCategoryLabel } from '../utils/catalogue';

function ShopByCategory() {
  const { isLoading, isError } = useCatalogue();
  const categories = useSelector(selectCategories);

  if (isError || (!isLoading && categories.length === 0)) return null;

  return (
    <section className="px-6 py-4 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl rounded-3xl bg-gray-100 px-6 py-10 md:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-3xl font-black md:text-4xl">SHOP BY CATEGORY</h2>

          <Link
            to="/products"
            className="text-sm font-semibold underline underline-offset-4 transition hover:text-gray-600"
          >
            View all products
          </Link>
        </div>

        {isLoading ? (
          <div
            role="status"
            aria-live="polite"
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
          >
            <span className="sr-only">Loading categories…</span>

            {Array.from({ length: 7 }, (_, index) => (
              <div
                key={index}
                aria-hidden="true"
                className="h-40 animate-pulse rounded-2xl bg-gray-200 md:h-48"
              />
            ))}
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  to={`/products?category=${category.slug}`}
                  className="group relative block h-40 overflow-hidden rounded-2xl bg-white md:h-48"
                >
                  <img
                    src={category.image}
                    alt=""
                    loading="lazy"
                    width="400"
                    height="300"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  <span className="absolute bottom-4 left-4 right-4 text-lg font-bold text-white">
                    {formatCategoryLabel(category.slug)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default ShopByCategory;
