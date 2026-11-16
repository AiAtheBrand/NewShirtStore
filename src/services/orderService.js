import { ApiError, apiRequest } from './apiClient';

export class OrderSubmissionUnavailableError extends Error {
  constructor(
    message = 'Order submission is unavailable because no backend is connected.',
  ) {
    super(message);
    this.name = 'OrderSubmissionUnavailableError';
    this.code = 'ORDER_BACKEND_UNAVAILABLE';
  }
}

function isOrdersEnabled() {
  return import.meta.env.VITE_ORDERS_ENABLED === 'true';
}

/**
 * Backend integration point for creating/submitting orders.
 *
 * Submits to POST /orders when VITE_ORDERS_ENABLED=true. Until a backend is
 * connected/enabled, submission is intentionally reported as unavailable and no
 * fake order is created.
 */
export async function submitOrderDraft(draft) {
  if (!draft || draft.status !== 'draft') {
    throw new Error('A valid order draft is required.');
  }

  if (!isOrdersEnabled()) {
    throw new OrderSubmissionUnavailableError();
  }

  try {
    return await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(draft),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new OrderSubmissionUnavailableError(
        'Order submission endpoint is unavailable on the configured backend.',
      );
    }

    throw error;
  }
}
