import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/apiClient';
import { selectAuthUser, selectIsAuthenticated } from '../store/authSlice';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatCurrency } from '../utils/formatCurrency';

function Orders() {
  useDocumentTitle('Orders — ShirtStore');
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectAuthUser);
  const [state, setState] = useState({
    orders: [],
    status: 'idle',
    error: null,
  });

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        setState((s) => ({ ...s, status: 'loading', error: null }));
      }
    });

    apiRequest('/orders')
      .then((data) => {
        if (!active) return;
        setState({
          orders: Array.isArray(data?.orders) ? data.orders : [],
          status: 'succeeded',
          error: null,
        });
      })
      .catch((err) => {
        if (!active) return;
        setState({
          orders: [],
          status: 'failed',
          error: err instanceof Error ? err.message : 'Failed to load orders.',
        });
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const { orders, status, error } = state;
  const isUnauthorized =
    status === 'failed' &&
    typeof error === 'string' &&
    /not authenticated|unauthorized|401/i.test(error);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 lg:px-16">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          Account
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">YOUR ORDERS</h1>
        {user && (
          <p className="mt-3 text-sm text-gray-500">
            Signed in as {user.fullName || user.email}
          </p>
        )}
      </header>

      {status === 'idle' || status === 'loading' ? (
        <p className="mt-10 text-sm text-gray-500">Loading orders…</p>
      ) : status === 'failed' ? (
        <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-900">
            {isUnauthorized ? 'Your session has expired.' : 'Could not load orders.'}
          </p>
          <p className="mt-2 text-sm text-red-700">
            {isUnauthorized ? 'Please sign in again to view your orders.' : error}
          </p>
          {isUnauthorized && (
            <Link
              to="/login"
              state={{ from: '/orders' }}
              className="mt-4 inline-block rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white"
            >
              Sign in again
            </Link>
          )}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-gray-300 p-10 text-center">
          <h2 className="text-xl font-bold">No orders yet.</h2>
          <p className="mt-2 text-sm text-gray-500">
            Orders you submit will appear here.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <ul className="mt-10 space-y-5">
          {orders.map((order) => {
            const draft = order.draft || {};
            const items = Array.isArray(draft.items) ? draft.items : [];
            const subtotal = draft.totals?.subtotal ?? 0;
            const currency = draft.totals?.currency ?? 'USD';
            return (
              <li key={order.id} className="rounded-2xl border border-gray-200 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Order #{order.id}</p>
                    <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">
                      Status: {order.status}
                    </p>
                  </div>
                  <p className="text-lg font-bold">
                    {formatCurrency(subtotal)} {currency}
                  </p>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  {items.map((item) => (
                    <li key={`${order.id}-${item.productId}`} className="flex justify-between gap-4">
                      <span>
                        {item.title} × {item.quantity}
                      </span>
                      <span>{formatCurrency(item.lineTotal ?? item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                {order.message && (
                  <p className="mt-4 text-sm text-gray-500">{order.message}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

export default Orders;
