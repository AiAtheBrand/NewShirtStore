import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import cartReducer from '../store/cartSlice';
import Checkout from './Checkout';

vi.mock('../services/orderService', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    submitOrderDraft: vi.fn(async () => {
      throw new actual.OrderSubmissionUnavailableError();
    }),
  };
});

const shirt = {
  id: 1,
  title: 'Classic Cotton Shirt',
  price: 25,
  thumbnail: 'shirt.jpg',
  brand: 'Basics',
  category: 'mens-shirts',
  stock: 3,
  quantity: 2,
};

function renderCheckout(preloadedItems = [shirt]) {
  const store = configureStore({
    reducer: { cart: cartReducer },
    preloadedState: { cart: { items: preloadedItems } },
  });

  render(
    <Provider store={store}>
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    </Provider>,
  );

  return store;
}

describe('Checkout page', () => {
  it('submits a draft through the order service and reports backend unavailability honestly', async () => {
    const user = userEvent.setup();
    const store = renderCheckout();

    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/street address/i), '1 Demo Street');
    await user.type(screen.getByLabelText(/city/i), 'Lagos');
    await user.type(screen.getByLabelText(/phone number/i), '08012345678');
    await user.click(
      screen.getByRole('button', { name: /review & submit draft/i }),
    );

    expect(
      await screen.findByText(/not submitted \(backend unavailable\)/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/order submission is unavailable because no backend is connected/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/no order was created/i)).toBeInTheDocument();
    expect(store.getState().cart.items).toHaveLength(1);
    expect(store.getState().cart.items[0].quantity).toBe(2);
  });
});