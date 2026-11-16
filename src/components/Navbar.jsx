import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CartDrawer from './CartDrawer';
import { selectCartCount } from '../store/cartSlice';
import cartIcon from '../assets/icons/cart-icon.svg';
import magnifyIcon from '../assets/icons/magnify-icon.svg';

const NAV_LINKS = [
  { label: 'Shop', to: '/products' },
  { label: 'Men', to: '/products?category=mens-shirts' },
  { label: 'Women', to: '/products?category=womens-dresses' },
  { label: 'New arrivals', to: '/products?sort=newest' },
];

function SearchForm({ id, onSubmitted }) {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const query = term.trim();

    navigate(
      query ? `/products?q=${encodeURIComponent(query)}` : '/products',
    );
    onSubmitted?.();
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2 rounded-full bg-gray-100 px-4 py-2"
    >
      <img
        src={magnifyIcon}
        alt=""
        aria-hidden="true"
        className="h-4 w-4 shrink-0 opacity-60"
      />

      <label htmlFor={id} className="sr-only">
        Search products
      </label>

      <input
        id={id}
        type="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Search for products..."
        autoComplete="off"
        className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
      />
    </form>
  );
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cartCount = useSelector(selectCartCount);
  const location = useLocation();

  const closeCart = useCallback(() => setCartOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const currentPath = `${location.pathname}${location.search}`;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-10 lg:px-16">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-lg leading-none md:hidden"
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          <Link to="/" className="text-xl font-black tracking-tight sm:text-2xl">
            SHIRTSTORE
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-6 text-sm font-medium md:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                aria-current={currentPath === link.to ? 'page' : undefined}
                className="transition hover:text-gray-500 aria-[current=page]:underline aria-[current=page]:underline-offset-4"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden w-56 lg:block xl:w-72">
              <SearchForm id="desktop-search" />
            </div>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart with ${cartCount} ${
                cartCount === 1 ? 'item' : 'items'
              }`}
              aria-haspopup="dialog"
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-gray-100"
            >
              <img src={cartIcon} alt="" aria-hidden="true" className="h-6 w-6" />

              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[11px] font-semibold text-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            id="mobile-menu"
            className="border-t border-gray-200 px-6 py-4 md:hidden"
          >
            <SearchForm
              id="mobile-search"
              onSubmitted={() => setMenuOpen(false)}
            />

            <nav aria-label="Mobile navigation" className="mt-4 flex flex-col">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  aria-current={currentPath === link.to ? 'page' : undefined}
                  className="border-b border-gray-100 py-3 text-sm font-medium last:border-b-0"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <CartDrawer isOpen={cartOpen} onClose={closeCart} />
    </>
  );
}

export default Navbar;
