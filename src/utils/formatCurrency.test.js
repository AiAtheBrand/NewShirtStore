import { describe, expect, it } from 'vitest';
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('formats whole and decimal amounts as US dollars', () => {
    expect(formatCurrency(9.99)).toBe('$9.99');
    expect(formatCurrency(40)).toBe('$40.00');
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('rounds to two decimal places', () => {
    expect(formatCurrency(0.005)).toBe('$0.01');
    expect(formatCurrency(19.999)).toBe('$20.00');
  });

  it('accepts numeric strings from the API', () => {
    expect(formatCurrency('24.5')).toBe('$24.50');
  });

  it('falls back to zero for invalid values', () => {
    expect(formatCurrency(undefined)).toBe('$0.00');
    expect(formatCurrency(null)).toBe('$0.00');
    expect(formatCurrency('not-a-number')).toBe('$0.00');
    expect(formatCurrency(Number.NaN)).toBe('$0.00');
  });
});
