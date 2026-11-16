import ProductCard from './ProductCard';

function RecentlyViewed({ items, title = 'Recently viewed' }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <section
      aria-labelledby="recently-viewed-title"
      className="mt-16 border-t border-gray-200 pt-12"
    >
      <h2 id="recently-viewed-title" className="text-2xl font-black md:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Products you looked at recently on this device.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default RecentlyViewed;