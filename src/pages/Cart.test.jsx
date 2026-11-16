import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import cartReducer from '../store/cartSlice';
import Cart from './Cart';

const shirt = {
  id: 1,
  title: 'Classic Cotton Shirt',
  price: 25,
  thumbnail: 'shirt.jpg',
  brand: 'Basics',
  category: 'mens-shirts',
  stock: 3,
  quantity: 1,
};

function renderCart(preloadedItems = []) {
  const store = configureStore({
    reducer: { cart: cartReducer },
    preloadedState: { cart: { items: preloadedItems } },
  });

  render(
    <Provider store={store}>
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    </Provider>,
  );

  return store;
}

describe('Cart page', () => {
  it('shows an empty state', () => {
    renderCart();

    expect(
      screen.getByRole('heading', { name: 'Your cart is empty.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start shopping/i })).toHaveAttribute(
      'href',
      '/products',
    );
  });

  it('lets the user update quantity and remove an item', async () => {
    const user = userEvent.setup();
    const store = renderCart([shirt]);

    expect(
      screen.getByRole('heading', { name: 'YOUR CART' }),
    ).toBeInTheDocument();
    expect(screen.getByText('$25.00 each')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /increase quantity of classic cotton shirt/i }),
    );
    expect(store.getState().cart.items[0].quantity).toBe(2);

    await user.click(
      screen.getByRole('button', { name: /remove classic cotton shirt from cart/i }),
    );
    expect(store.getState().cart.items).toEqual([]);
    expect(
      screen.getByRole('heading', { name: 'Your cart is empty.' }),
    ).toBeInTheDocument();
  });
});
