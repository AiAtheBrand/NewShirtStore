import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearAuthError, loginUser, selectAuth } from '../store/authSlice';
import { replaceCart } from '../store/cartSlice';
import { cartRepository } from '../services/cartRepository';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

function Login() {
  useDocumentTitle('Login — ShirtStore');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector(selectAuth);
  const [form, setForm] = useState({ email: '', password: '' });

  const from = location.state?.from || '/';

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((c) => ({ ...c, [name]: value }));
    if (error) dispatch(clearAuthError());
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      const localItems = await cartRepository.load().catch(() => []);
      const items = await cartRepository.merge(localItems).catch(() => cartRepository.load());
      if (Array.isArray(items)) dispatch(replaceCart(items));
      navigate(from, { replace: true });
    }
  };

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-black tracking-tight">Login</h1>
      <p className="mt-2 text-sm text-gray-500">
        Sign in to sync your cart and orders with the backend.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
        >
          {status === 'loading' ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600">
        No account?{' '}
        <Link to="/register" className="font-semibold underline underline-offset-4">
          Create one
        </Link>
      </p>
    </main>
  );
}

export default Login;
