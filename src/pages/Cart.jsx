import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  selectCartCount,
  selectCartItems,
  selectCartSubtotal,
} from '../store/cartSlice';
import { formatCurrency } from '../utils/formatCurrency';
import addIcon from '../assets/icons/add-icon.svg';
import reduceIcon from '../assets/icons/reduce-icon.svg';
import deleteIcon from '../assets/icons/delete-icon.svg';

function Cart() {
  useDocumentTitle('Your cart — ShirtStore');

  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const cartCount = useSelector(selectCartCount);
  const subtotal = useSelector(selectCartSubtotal);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 lg:px-16">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          Shopping cart
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">YOUR CART</h1>
        <p className="mt-3 text-sm text-gray-500">
          {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart. Your cart
          is saved in this browser.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-gray-300 p-10 text-center">
          <h2 className="text-xl font-bold">Your cart is empty.</h2>
          <p className="mt-2 text-sm text-gray-500">
            Browse the collection and add a piece you love.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <ul className="space-y-6">
            {items.map((item) => {
              const stock = Number(item.stock);
              const stockLimit = Number.isFinite(stock)
                ? stock
                : Number.POSITIVE_INFINITY;
              const atStockLimit = item.quantity >= stockLimit;

              return (
                <li
                  key={item.id}
                  className="flex gap-4 border-b border-gray-200 pb-6 sm:gap-6"
                >
                  <Link to={`/products/${item.id}`} className="shrink-0">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      width="112"
                      height="112"
                      className="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to={`/products/${item.id}`}
                          className="line-clamp-2 text-base font-semibold transition hover:underline hover:underline-offset-4"
                        >
                          {item.title}
                        </Link>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatCurrency(item.price)} each
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => dispatch(removeFromCart(item.id))}
                        aria-label={`Remove ${item.title} from cart`}
                        className="rounded-full p-2 transition hover:bg-gray-100"
                      >
                        <img src={deleteIcon} alt="" className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => dispatch(decreaseQuantity(item.id))}
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease quantity of ${item.title}`}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <img src={reduceIcon} alt="" className="h-3.5 w-3.5" />
                        </button>

                        <span className="min-w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => dispatch(increaseQuantity(item.id))}
                          disabled={atStockLimit}
                          aria-label={`Increase quantity of ${item.title}`}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <img src={addIcon} alt="" className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="text-base font-bold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>

                    {atStockLimit && (
                      <p className="mt-2 text-xs text-gray-500">
                        Maximum available quantity reached.
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit rounded-2xl border border-gray-200 p-6 lg:sticky lg:top-24">
            <h2 className="text-xl font-bold">Order summary</h2>

            <div className="mt-5 flex items-center justify-between text-sm text-gray-600">
              <span>Items ({cartCount})</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 text-lg font-bold">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Shipping and taxes are not included at this step.
            </p>

            <Link
              to="/checkout"
              className="mt-6 block w-full rounded-full bg-black px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Proceed to checkout
            </Link>

            <Link
              to="/products"
              className="mt-3 block w-full rounded-full border border-gray-300 px-6 py-3 text-center text-sm font-semibold transition hover:border-black"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Cart;
