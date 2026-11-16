import { describe, expect, it } from 'vitest';
import {
  createOrderDraft,
  validateCustomer,
} from './checkout';

describe('checkout domain', () => {
  it('validates required customer fields and email format', () => {
    expect(validateCustomer({
      fullName: '',
      email: 'bad',
      address: '',
      city: '',
      phone: '',
    })).toEqual({
      fullName: 'Enter your full name.',
      email: 'Enter a valid email address.',
      address: 'Enter your street address.',
      city: 'Enter your city.',
      phone: 'Enter your phone number.',
    });

    expect(validateCustomer({
      fullName: 'Ada',
      email: 'ada@example.com',
      address: '1 Road',
      city: 'Lagos',
      phone: '123',
    })).toEqual({});
  });

  it('creates a backend-ready order draft without mutating input', () => {
    const items = [
      { id: 1, title: 'Shirt', price: 10, quantity: 2, thumbnail: 'a.jpg', brand: 'B', category: 'tops' },
    ];

    const draft = createOrderDraft({
      customer: {
        fullName: ' Ada ',
        email: ' ada@example.com ',
        address: ' 1 Road ',
        city: ' Lagos ',
        phone: ' 123 ',
      },
      items,
      currency: 'USD',
    });

    expect(draft).toEqual({
      customer: {
        fullName: 'Ada',
        email: 'ada@example.com',
        address: '1 Road',
        city: 'Lagos',
        phone: '123',
      },
      items: [
        {
          productId: 1,
          title: 'Shirt',
          price: 10,
          quantity: 2,
          lineTotal: 20,
          thumbnail: 'a.jpg',
          brand: 'B',
          category: 'tops',
        },
      ],
      totals: { subtotal: 20, currency: 'USD' },
      status: 'draft',
    });
    expect(items[0]).toEqual({ id: 1, title: 'Shirt', price: 10, quantity: 2, thumbnail: 'a.jpg', brand: 'B', category: 'tops' });
  });
});
