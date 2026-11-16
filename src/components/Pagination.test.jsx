import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Pagination from './Pagination';

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(
      <Pagination page={1} pageCount={1} onChange={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the current page and disables previous on the first page', () => {
    render(<Pagination page={1} pageCount={3} onChange={vi.fn()} />);

    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /previous/i }),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
  });

  it('moves to the next and previous pages', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Pagination page={2} pageCount={3} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(onChange).toHaveBeenLastCalledWith(3);

    await user.click(screen.getByRole('button', { name: /previous/i }));
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it('disables next on the last page', () => {
    render(<Pagination page={3} pageCount={3} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });
});
