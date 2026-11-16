import { describe, expect, it } from 'vitest';
import {
  OrderSubmissionUnavailableError,
  submitOrderDraft,
} from './orderService';

const draft = {
  status: 'draft',
  customer: { fullName: 'Ada' },
  items: [{ productId: 1, quantity: 1, price: 10, lineTotal: 10 }],
  totals: { subtotal: 10, currency: 'USD' },
};

describe('orderService', () => {
  it('rejects with a backend-unavailable error until an order API exists', async () => {
    await expect(submitOrderDraft(draft)).rejects.toBeInstanceOf(
      OrderSubmissionUnavailableError,
    );
  });

  it('requires a draft payload', async () => {
    await expect(submitOrderDraft(null)).rejects.toThrow(
      'A valid order draft is required.',
    );
  });
});
