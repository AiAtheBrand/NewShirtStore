export class OrderSubmissionUnavailableError extends Error {
  constructor(
    message = 'Order submission is unavailable because no backend is connected.',
  ) {
    super(message);
    this.name = 'OrderSubmissionUnavailableError';
    this.code = 'ORDER_BACKEND_UNAVAILABLE';
  }
}

/**
 * Backend integration point for creating/submitting orders.
 *
 * Today this storefront has no order API, so submission is intentionally not
 * performed. When a backend is added, replace this implementation with a real
 * request (e.g. POST /orders) and return the created order/confirmation.
 */
export async function submitOrderDraft(draft) {
  if (!draft || draft.status !== 'draft') {
    throw new Error('A valid order draft is required.');
  }

  throw new OrderSubmissionUnavailableError();
}
