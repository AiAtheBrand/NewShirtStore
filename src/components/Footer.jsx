import { Link } from 'react-router-dom';
import { FASHION_CATEGORIES } from '../api/productApi';
import { formatCategoryLabel } from '../utils/catalogue';

const SHOP_LINKS = [
  { label: 'All products', to: '/products' },
  { label: 'New arrivals', to: '/products?sort=newest' },
  { label: 'Top rated', to: '/products?sort=rating-desc' },
  { label: 'Under $30', to: '/products?price=under-30' },
];

function FooterLink({ to, children }) {
  return (
    <li>
      <Link to={to} className="transition hover:text-black">
        {children}
      </Link>
    </li>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-100 px-6 pb-8 pt-12 md:px-10 lg:px-16">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="text-2xl font-black">
            SHIRTSTORE
          </Link>

          <p className="mt-4 max-w-xs text-sm leading-6 text-gray-500">
            A curated demo storefront for modern clothing, shoes and
            accessories. Built with React, Redux Toolkit and Tailwind CSS.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-black">
            Shop
          </h3>

          <ul className="space-y-3 text-sm text-gray-500">
            {SHOP_LINKS.map((link) => (
              <FooterLink key={link.label} to={link.to}>
                {link.label}
              </FooterLink>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-black">
            Categories
          </h3>

          <ul className="space-y-3 text-sm text-gray-500">
            {FASHION_CATEGORIES.map((category) => (
              <FooterLink
                key={category}
                to={`/products?category=${category}`}
              >
                {formatCategoryLabel(category)}
              </FooterLink>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-black">
            About this build
          </h3>

          <ul className="space-y-3 text-sm text-gray-500">
            <li>Demo checkout — no payments are taken.</li>
            <li>
              Product data from{' '}
              <a
                href="https://dummyjson.com"
                target="_blank"
                rel="noreferrer"
                className="underline transition hover:text-black"
              >
                DummyJSON
              </a>
              .
            </li>
            <li>
              No account or newsletter data is stored.
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t border-gray-300 pt-6 text-center text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p>ShirtStore © 2026. Demo project — not a real shop.</p>
        <p>Prices shown in USD.</p>
      </div>
    </footer>
  );
}

export default Footer;
