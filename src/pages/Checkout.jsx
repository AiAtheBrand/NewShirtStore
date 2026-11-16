import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { selectCartItems, selectCartSubtotal } from '../store/cartSlice';
import { formatCurrency } from '../utils/formatCurrency';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  address: '',
  city: '',
  phone: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values) {
  const errors = {};

  if (!values.fullName.trim()) {
    errors.fullName = 'Enter your full name.';
  }

  if (!values.email.trim()) {
    errors.email = 'Enter your email address.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.address.trim()) {
    errors.address = 'Enter your street address.';
  }

  if (!values.city.trim()) {
    errors.city = 'Enter your city.';
  }

  if (!values.phone.trim()) {
    errors.phone = 'Enter your phone number.';
  }

  return errors;
}

function FormField({
  id,
  label,
  type = 'text',
  autoComplete,
  value,
  error,
  onChange,
  placeholder,
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black aria-[invalid=true]:border-red-500"
      />

      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function Checkout() {
  useDocumentTitle('Checkout — ShirtStore');

  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  const cartIsEmpty = cartItems.length === 0;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (cartIsEmpty) return;

    const nextErrors = validate(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setDemoSubmitted(false);
      return;
    }

    // There is no backend yet, so this deliberately does not clear the cart,
    // log customer details, or pretend an order was created.
    setDemoSubmitted(true);
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          Demo checkout
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-tight">CHECKOUT</h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
          This form validates your details, but no order is placed and no
          payment is taken. Nothing you type is sent or stored.
        </p>
      </header>

      {demoSubmitted && (
        <div
          role="status"
          className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-6"
        >
          <h2 className="text-lg font-bold">Demo checkout only</h2>

          <p className="mt-2 text-sm leading-6 text-amber-900">
            Thanks, {formData.fullName.trim()}. This demo has no backend or
            payment provider, so no order was created, nothing was charged, and
            your cart is unchanged.
          </p>

          <button
            type="button"
            onClick={() => setDemoSubmitted(false)}
            className="mt-4 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Edit details
          </button>
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <form id="checkout-form" onSubmit={handleSubmit} noValidate>
          <fieldset disabled={cartIsEmpty} className="disabled:opacity-60">
            <legend className="text-xl font-bold">Customer information</legend>

            <div className="mt-6 space-y-5">
              <FormField
                id="fullName"
                label="Full name"
                autoComplete="name"
                value={formData.fullName}
                error={errors.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
              />

              <FormField
                id="email"
                label="Email address"
                type="email"
                autoComplete="email"
                value={formData.email}
                error={errors.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />

              <FormField
                id="address"
                label="Street address"
                autoComplete="street-address"
                value={formData.address}
                error={errors.address}
                onChange={handleChange}
                placeholder="Enter your address"
              />

              <FormField
                id="city"
                label="City"
                autoComplete="address-level2"
                value={formData.city}
                error={errors.city}
                onChange={handleChange}
                placeholder="Enter your city"
              />

              <FormField
                id="phone"
                label="Phone number"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                error={errors.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>
          </fieldset>
        </form>

        <section aria-labelledby="order-summary-title">
          <h2 id="order-summary-title" className="text-xl font-bold">
            Order summary
          </h2>

          {cartIsEmpty ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-8 text-center">
              <p className="font-semibold">Your cart is empty.</p>
              <p className="mt-2 text-sm text-gray-500">
                Add a product before using the checkout form.
              </p>

              <Link
                to="/products"
                className="mt-5 inline-block rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <ul className="mt-6 space-y-5">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 border-b border-gray-200 pb-5"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    width="80"
                    height="80"
                    className="h-20 w-20 rounded-lg object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.title}</p>

                    <p className="mt-1 text-sm text-gray-500">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>

                    <p className="mt-2 font-semibold">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex justify-between text-xl font-bold">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Shipping and taxes are not calculated in this demo.
            </p>

            <button
              type="submit"
              form="checkout-form"
              disabled={cartIsEmpty}
              className="mt-6 w-full rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
            >
              Place demo order
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Checkout;
