import { afterEach, describe, expect, it, vi } from 'vitest';

const draft = {
  status: 'draft',
  customer: { fullName: 'Ada' },
  items: [{ productId: 1, quantity: 1, price: 10, lineTotal: 10 }],
  totals: { subtotal: 10, currency: 'USD' },
};

async function loadService() {
  vi.resetModules();
  return import('./orderService');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('orderService', () => {
  it('rejects with a backend-unavailable error when orders are not enabled', async () => {
    vi.stubEnv('VITE_ORDERS_ENABLED', 'false');
    const { OrderSubmissionUnavailableError, submitOrderDraft } =
      await loadService();

    await expect(submitOrderDraft(draft)).rejects.toBeInstanceOf(
      OrderSubmissionUnavailableError,
    );
  });

  it('requires a draft payload', async () => {
    vi.stubEnv('VITE_ORDERS_ENABLED', 'false');
    const { submitOrderDraft } = await loadService();

    await expect(submitOrderDraft(null)).rejects.toThrow(
      'A valid order draft is required.',
    );
  });
});
