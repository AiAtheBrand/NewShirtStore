import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

function NotFound() {
  useDocumentTitle('Page not found — ShirtStore');

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
        404
      </p>

      <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
        We could not find that page.
      </h1>

      <p className="mt-4 max-w-md text-sm leading-6 text-gray-500">
        The link may be outdated, or the page may never have existed. The
        catalogue is still right where you left it.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Back home
        </Link>

        <Link
          to="/products"
          className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold transition hover:border-black"
        >
          Browse products
        </Link>
      </div>
    </main>
  );
}

export default NotFound;
