function ProductGridSkeleton({ count = 8 }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading products…</span>
      <div
        aria-hidden="true"
        className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
      >
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-square rounded-2xl bg-gray-200" />
            <div className="mt-4 h-3 w-1/3 rounded bg-gray-200" />
            <div className="mt-3 h-5 w-4/5 rounded bg-gray-200" />
            <div className="mt-3 h-4 w-1/2 rounded bg-gray-200" />
            <div className="mt-4 h-11 w-full rounded-full bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductGridSkeleton;
