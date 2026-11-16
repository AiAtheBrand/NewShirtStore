import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useProductDetail } from '../hooks/useProductDetail';
import {
  addToCartQuantity,
  selectCartQuantityById,
} from '../store/cartSlice';
import { formatCategoryLabel } from '../utils/catalogue';
import { formatCurrency } from '../utils/formatCurrency';
import starIcon from '../assets/icons/Star.svg';
import addIcon from '../assets/icons/add-icon.svg';
import reduceIcon from '../assets/icons/reduce-icon.svg';
import arrowLeftIcon from '../assets/icons/arrow-left-bold.svg';

function DetailSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto max-w-7xl px-6 py-12 md:px-10 lg:px-16"
    >
      <span className="sr-only">Loading product…</span>

      <div aria-hidden="true" className="grid animate-pulse gap-10 lg:grid-cols-2">
        <div className="aspect-square rounded-3xl bg-gray-200" />

        <div>
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="mt-4 h-10 w-4/5 rounded bg-gray-200" />
          <div className="mt-4 h-4 w-32 rounded bg-gray-200" />
          <div className="mt-8 h-8 w-28 rounded bg-gray-200" />
          <div className="mt-6 space-y-3">
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-2/3 rounded bg-gray-200" />
          </div>
          <div className="mt-8 h-12 w-full rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function ProductNotFound({ message, onRetry }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
        Product
      </p>

      <h1 className="mt-3 text-4xl font-black tracking-tight">
        We could not find that product.
      </h1>

      <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-gray-500">
        {message ??
          'It may have been removed from the catalogue, or the link may be incorrect.'}
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/products"
          className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Back to products
        </Link>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold transition hover:border-black"
          >
            Try again
          </button>
        )}
      </div>
    </main>
  );
}

function ProductDetails({ product }) {
  const dispatch = useDispatch();
  const [selectedImage, setSelectedImage] = useState(product.images?.[0] ?? product.thumbnail);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const quantityInCart = useSelector((state) =>
    selectCartQuantityById(state, product.id),
  );

  const stock = Number(product.stock);
  const hasStock = Number.isFinite(stock) && stock > 0;
  const remaining = hasStock ? Math.max(0, stock - quantityInCart) : 0;
  const images =
    product.images?.length > 0
      ? product.images
      : [product.thumbnail].filter(Boolean);
  const activeImage = images.includes(selectedImage)
    ? selectedImage
    : images[0];

  const discount = Number(product.discountPercentage) || 0;
  const originalPrice =
    discount > 0 && discount < 100
      ? product.price / (1 - discount / 100)
      : null;

  const maxSelectable = Math.max(1, Math.min(quantity, remaining || 1));

  const changeQuantity = (nextQuantity) => {
    setQuantity(Math.max(1, Math.min(nextQuantity, Math.max(remaining, 1))));
    setAdded(false);
  };

  const handleAdd = () => {
    if (remaining <= 0) return;

    dispatch(
      addToCartQuantity({
        product,
        quantity: Math.min(maxSelectable, remaining),
      }),
    );
    setAdded(true);
  };

  const addLabel = !hasStock
    ? 'Out of stock'
    : remaining === 0
      ? 'Max in cart'
      : `Add ${maxSelectable} to cart`;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 md:px-10 lg:px-16">
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to="/" className="transition hover:text-black">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/products" className="transition hover:text-black">
              Products
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              to={`/products?category=${product.category}`}
              className="transition hover:text-black"
            >
              {formatCategoryLabel(product.category)}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="max-w-60 truncate text-black">
            {product.title}
          </li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-3xl bg-gray-100">
            <img
              src={activeImage}
              alt={product.title}
              width="800"
              height="800"
              className="h-full w-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <ul className="mt-4 flex flex-wrap gap-3" aria-label="Product images">
              {images.map((image, index) => (
                <li key={image}>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    aria-label={`Show image ${index + 1} of ${images.length}`}
                    aria-pressed={image === activeImage}
                    className="h-20 w-20 overflow-hidden rounded-xl border-2 border-transparent bg-gray-100 transition aria-pressed:border-black"
                  >
                    <img
                      src={image}
                      alt=""
                      width="80"
                      height="80"
                      className="h-full w-full object-cover"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
            {product.brand || formatCategoryLabel(product.category)}
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
            {product.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <img src={starIcon} alt="" aria-hidden="true" className="h-4 w-4" />
              {Number(product.rating || 0).toFixed(1)} out of 5
            </span>

            <span aria-hidden="true">·</span>

            <span>
              {hasStock
                ? `In stock${stock <= 5 ? ` — only ${stock} left` : ''}`
                : 'Out of stock'}
            </span>

            {quantityInCart > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{quantityInCart} in your cart</span>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <p className="text-3xl font-black">{formatCurrency(product.price)}</p>

            {originalPrice && (
              <p className="text-lg text-gray-400 line-through">
                {formatCurrency(originalPrice)}
              </p>
            )}

            {discount > 0 && (
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                -{Math.round(discount)}%
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-6 max-w-prose text-sm leading-7 text-gray-600">
              {product.description}
            </p>
          )}

          {product.tags?.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Product tags">
              {product.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex items-center self-start rounded-full border border-gray-300">
              <button
                type="button"
                onClick={() => changeQuantity(quantity - 1)}
                disabled={maxSelectable <= 1 || remaining <= 0}
                aria-label="Decrease quantity"
                className="flex h-11 w-11 items-center justify-center rounded-l-full transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <img src={reduceIcon} alt="" aria-hidden="true" className="h-3.5 w-3.5" />
              </button>

              <span className="min-w-8 text-center text-sm font-semibold">
                {maxSelectable}
              </span>

              <button
                type="button"
                onClick={() => changeQuantity(quantity + 1)}
                disabled={maxSelectable >= remaining || remaining <= 0}
                aria-label="Increase quantity"
                className="flex h-11 w-11 items-center justify-center rounded-r-full transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <img src={addIcon} alt="" aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={remaining <= 0}
              className="w-full rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 sm:w-auto sm:min-w-56"
            >
              {addLabel}
            </button>
          </div>

          <p aria-live="polite" className="mt-3 min-h-5 text-sm text-green-700">
            {added && 'Added to cart.'}
          </p>

          <dl className="mt-8 grid gap-4 border-t border-gray-200 pt-6 sm:grid-cols-2">
            {product.shippingInformation && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Shipping
                </dt>
                <dd className="mt-1 text-sm text-gray-600">
                  {product.shippingInformation}
                </dd>
              </div>
            )}

            {product.warrantyInformation && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Warranty
                </dt>
                <dd className="mt-1 text-sm text-gray-600">
                  {product.warrantyInformation}
                </dd>
              </div>
            )}

            {product.returnPolicy && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Returns
                </dt>
                <dd className="mt-1 text-sm text-gray-600">
                  {product.returnPolicy}
                </dd>
              </div>
            )}

            {product.sku && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  SKU
                </dt>
                <dd className="mt-1 text-sm text-gray-600">{product.sku}</dd>
              </div>
            )}
          </dl>

          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4 transition hover:text-gray-600"
          >
            <img src={arrowLeftIcon} alt="" aria-hidden="true" className="h-4 w-4" />
            Back to all products
          </Link>
        </div>
      </div>
    </main>
  );
}

function ProductDetail() {
  const { productId } = useParams();
  const id = Number(productId);
  const hasValidId = Number.isInteger(id) && id > 0;
  const { item, status, error, requestedId, retry } = useProductDetail(id);

  const product = hasValidId && item?.id === id ? item : null;
  const isCurrentError = status === 'failed' && requestedId === id;
  const showNotFound = !hasValidId || isCurrentError;
  const showLoading = hasValidId && !product && !showNotFound;

  useDocumentTitle(
    product ? `${product.title} — ShirtStore` : 'Product — ShirtStore',
  );

  if (showLoading) return <DetailSkeleton />;

  if (showNotFound) {
    const isMissing =
      !hasValidId ||
      error?.includes('404') ||
      error?.includes('not part of the storefront');

    return (
      <ProductNotFound
        message={
          isMissing
            ? 'This product does not exist in the curated catalogue.'
            : error
        }
        onRetry={isMissing ? undefined : retry}
      />
    );
  }

  if (!product) return <DetailSkeleton />;

  return <ProductDetails key={product.id} product={product} />;
}

export default ProductDetail;
