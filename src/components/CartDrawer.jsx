import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import closeIcon from '../assets/icons/close-icon.svg';
import addIcon from '../assets/icons/add-icon.svg';
import reduceIcon from '../assets/icons/reduce-icon.svg';
import deleteIcon from '../assets/icons/delete-icon.svg';
import {
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  selectCartCount,
  selectCartItems,
  selectCartSubtotal,
} from '../store/cartSlice';
import { formatCurrency } from '../utils/formatCurrency';

function CartDrawer({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const cartCount = useSelector(selectCartCount);
  const subtotal = useSelector(selectCartSubtotal);
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const trapFocus = (event) => {
    if (event.key !== 'Tab') return;

    const focusableElements = drawerRef.current?.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (!focusableElements?.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  if (!isOpen) return null;

  const startShopping = () => {
    onClose();
    navigate('/products');
  };

  const goToCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 bg-black/40"
      />

      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        onKeyDown={trapFocus}
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <h2 id="cart-drawer-title" className="text-xl font-bold">
            Your cart{' '}
            <span className="font-normal text-gray-500">
              ({cartCount} {cartCount === 1 ? 'item' : 'items'})
            </span>
          </h2>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition hover:bg-gray-800"
          >
            <img src={closeIcon} alt="" className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-lg font-semibold">Your cart is empty.</p>
              <p className="mt-2 max-w-xs text-sm text-gray-500">
                Browse the collection and add a piece you love.
              </p>
              <button
                type="button"
                onClick={startShopping}
                className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Start shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => {
                const stock = Number(item.stock);
                const stockLimit = Number.isFinite(stock)
                  ? stock
                  : Number.POSITIVE_INFINITY;
                const atStockLimit = item.quantity >= stockLimit;

                return (
                  <li key={item.id} className="flex gap-4">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      width="80"
                      height="80"
                      className="h-20 w-20 rounded-xl object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="line-clamp-2 text-sm font-semibold">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {formatCurrency(item.price)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => dispatch(removeFromCart(item.id))}
                          aria-label={`Remove ${item.title} from cart`}
                          className="rounded-full p-1.5 transition hover:bg-gray-100"
                        >
                          <img
                            src={deleteIcon}
                            alt=""
                            className="h-4 w-4"
                          />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(decreaseQuantity(item.id))
                            }
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease quantity of ${item.title}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <img
                              src={reduceIcon}
                              alt=""
                              className="h-3.5 w-3.5"
                            />
                          </button>

                          <span
                            className="min-w-6 text-center text-sm font-medium"
                            aria-live="polite"
                          >
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              dispatch(increaseQuantity(item.id))
                            }
                            disabled={atStockLimit}
                            aria-label={`Increase quantity of ${item.title}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <img
                              src={addIcon}
                              alt=""
                              className="h-3.5 w-3.5"
                            />
                          </button>
                        </div>

                        <p className="text-sm font-bold">
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
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-5">
            <div className="flex items-center justify-between text-base font-bold">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Shipping and taxes are not included.
            </p>

            <button
              type="button"
              onClick={goToCheckout}
              className="mt-4 w-full rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;
