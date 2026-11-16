import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/productApi', () => ({
  getCatalogue: vi.fn(),
  getProductById: vi.fn(),
  FASHION_CATEGORIES: [],
}));

import { getProductById } from '../api/productApi';
import cartReducer from '../store/cartSlice';
import productReducer from '../store/productSlice';
import ProductDetail from './ProductDetail';

const detail = {
  id: 1,
  title: 'Classic Cotton Shirt',
  description: 'A soft, everyday shirt.',
  price: 25,
  discountPercentage: 20,
  rating: 4.5,
  stock: 5,
  brand: 'Basics',
  category: 'mens-shirts',
  tags: ['cotton', 'casual'],
  thumbnail: 'shirt.jpg',
  images: ['shirt.jpg', 'shirt-2.jpg'],
  sku: 'SKU-1',
  warrantyInformation: '1 year warranty',
  shippingInformation: 'Ships in 2 days',
  returnPolicy: '30 days return',
  createdAt: '2025-01-01T00:00:00.000Z',
};

function renderPage({ path = '/products/1', preloadedState } = {}) {
  const store = configureStore({
    reducer: { products: productReducer, cart: cartReducer },
    preloadedState,
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/products/:productId" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  return store;
}

describe('ProductDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the product, lets the user pick a quantity and add to cart', async () => {
    getProductById.mockResolvedValueOnce(detail);
    const user = userEvent.setup();
    const store = renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Classic Cotton Shirt' }),
    ).toBeInTheDocument();

    expect(screen.getByText('A soft, everyday shirt.')).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
    expect(screen.getByText('$31.25')).toBeInTheDocument();
    expect(screen.getByText('-20%')).toBeInTheDocument();
    expect(screen.getByText('Ships in 2 days')).toBeInTheDocument();
    expect(screen.getByText('SKU-1')).toBeInTheDocument();
    expect(getProductById).toHaveBeenCalledWith(1);

    await user.click(screen.getByRole('button', { name: /increase quantity/i }));
    await user.click(screen.getByRole('button', { name: /add 2 to cart/i }));

    expect(store.getState().cart.items).toEqual([
      expect.objectContaining({
        id: 1,
        title: 'Classic Cotton Shirt',
        quantity: 2,
        price: 25,
      }),
    ]);
    expect(await screen.findByText('Added to cart.')).toBeInTheDocument();
  });

  it('shows the not-found state for an invalid id', async () => {
    renderPage({ path: '/products/abc' });

    expect(
      await screen.findByRole('heading', {
        name: 'We could not find that product.',
      }),
    ).toBeInTheDocument();

    expect(screen.queryByText('Try again')).not.toBeInTheDocument();
    expect(getProductById).not.toHaveBeenCalled();
  });

  it('shows the not-found state when the product is not in the catalogue', async () => {
    getProductById.mockRejectedValueOnce(
      new Error('Product API request failed (404 Not Found)'),
    );

    renderPage({ path: '/products/999' });

    expect(
      await screen.findByRole('heading', {
        name: 'We could not find that product.',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText('This product does not exist in the curated catalogue.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Try again')).not.toBeInTheDocument();
  });
});
