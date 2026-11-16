import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectAuthInitialized, selectIsAuthenticated } from '../store/authSlice';

function RequireAuth({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const initialized = useSelector(selectAuthInitialized);
  const location = useLocation();

  if (!initialized) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16 text-sm text-gray-500">
        Checking your session…
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default RequireAuth;
