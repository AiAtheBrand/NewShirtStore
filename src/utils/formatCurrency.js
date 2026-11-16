const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

/**
 * Formats a numeric amount for display. Invalid input falls back to $0.00
 * so a bad API value can never render "NaN" in the UI.
 */
export function formatCurrency(value) {
  const amount = Number(value);
  return currencyFormatter.format(Number.isFinite(amount) ? amount : 0);
}
