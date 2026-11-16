import { calculateCartSubtotal } from './cart';

export const EMPTY_CUSTOMER = {
  fullName: '',
  email: '',
  address: '',
  city: '',
  phone: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCustomer(values) {
  const errors = {};

  if (!values.fullName?.trim()) {
    errors.fullName = 'Enter your full name.';
  }

  if (!values.email?.trim()) {
    errors.email = 'Enter your email address.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.address?.trim()) {
    errors.address = 'Enter your street address.';
  }

  if (!values.city?.trim()) {
    errors.city = 'Enter your city.';
  }

  if (!values.phone?.trim()) {
    errors.phone = 'Enter your phone number.';
  }

  return errors;
}

export function createOrderDraft({ customer, items, currency = 'USD' }) {
  const safeItems = Array.isArray(items) ? items : [];

  return {
    customer: {
      fullName: customer.fullName?.trim() ?? '',
      email: customer.email?.trim() ?? '',
      address: customer.address?.trim() ?? '',
      city: customer.city?.trim() ?? '',
      phone: customer.phone?.trim() ?? '',
    },
    items: safeItems.map((item) => ({
      productId: item.id,
      title: item.title,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 0,
      lineTotal: Math.round(Number(item.price || 0) * Number(item.quantity || 0) * 100) / 100,
      thumbnail: item.thumbnail ?? '',
      brand: item.brand ?? null,
      category: item.category ?? '',
    })),
    totals: {
      subtotal: calculateCartSubtotal(safeItems),
      currency,
    },
    status: 'draft',
  };
}
