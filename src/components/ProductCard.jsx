import { useDispatch, useSelector } from 'react-redux';
import { addToCart, selectCartQuantityById } from '../store/cartSlice';
import { formatCurrency } from '../utils/formatCurrency';
import { formatCategoryLabel } from '../utils/catalogue';
import starIcon from '../assets/icons/Star.svg';

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const quantityInCart = useSelector((state) =>
    selectCartQuantityById(state, product.id),
  );

  const stock = Number(product.stock);
  const isOutOfStock = !Number.isFinite(stock) || stock <= 0;
  const isAtLimit = !isOutOfStock && quantityInCart >= stock;
  const brandLabel = product.brand || formatCategoryLabel(product.category);

  const buttonLabel = isOutOfStock
    ? 'Out of stock'
    : isAtLimit
      ? 'Max in cart'
      : 'Add to cart';

  const accessibleLabel = isOutOfStock
    ? `${product.title} is out of stock`
    : isAtLimit
      ? `Maximum quantity reached for ${product.title}`
      : `Add ${product.title} to cart`;

  return (
    <article className="group flex flex-col">
      <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          width="400"
          height="400"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-xs uppercase tracking-[0.12em] text-gray-500">
          {brandLabel}
        </p>

        <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug">
          {product.title}
        </h3>

        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
          <img src={starIcon} alt="" aria-hidden="true" className="h-4 w-4" />
          <span>{Number(product.rating || 0).toFixed(1)}</span>
        </div>

        <p className="mt-3 text-lg font-bold">
          {formatCurrency(product.price)}
        </p>

        <button
          type="button"
          onClick={() => dispatch(addToCart(product))}
          disabled={isOutOfStock || isAtLimit}
          aria-label={accessibleLabel}
          className="mt-4 w-full rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
        >
          {buttonLabel}
        </button>

        {isAtLimit && (
          <p className="mt-2 text-xs text-gray-500">
            Only {stock} available.
          </p>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
