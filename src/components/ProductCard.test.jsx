import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import cartReducer, { selectCartCount } from '../store/cartSlice';
import ProductCard from './ProductCard';

const product = {
  id: 1,
  title: 'Classic Cotton Shirt',
  price: 19.99,
  rating: 4.4,
  stock: 2,
  brand: 'Basics',
  category: 'mens-shirts',
  thumbnail: 'shirt.jpg',
};

function renderCard(overrides = {}) {
  const store = configureStore({ reducer: { cart: cartReducer } });

  render(
    <Provider store={store}>
      <MemoryRouter>
        <ProductCard product={{ ...product, ...overrides }} />
      </MemoryRouter>
    </Provider>,
  );

  return store;
}

describe('ProductCard', () => {
  it('shows the formatted price, rating and brand', () => {
    renderCard();

    expect(screen.getByText('$19.99')).toBeInTheDocument();
    expect(screen.getByText('4.4')).toBeInTheDocument();
    expect(screen.getByText('Basics')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Classic Cotton Shirt' }),
    ).toBeInTheDocument();
  });

  it('adds the product to the cart', async () => {
    const user = userEvent.setup();
    const store = renderCard();

    await user.click(screen.getByRole('button', { name: /add classic cotton shirt to cart/i }));

    expect(selectCartCount(store.getState())).toBe(1);
  });

  it('disables the button when stock is exhausted', () => {
    renderCard({ stock: 0 });

    expect(
      screen.getByRole('button', { name: /out of stock/i }),
    ).toBeDisabled();
  });

  it('caps the quantity at the available stock', async () => {
    const user = userEvent.setup();
    const store = renderCard();

    const button = screen.getByRole('button');
    await user.click(button);
    await user.click(button);

    expect(selectCartCount(store.getState())).toBe(2);
    expect(
      screen.getByRole('button', { name: /maximum quantity reached/i }),
    ).toBeDisabled();
    expect(screen.getByText('Only 2 available.')).toBeInTheDocument();
  });
});
