const API_URL = import.meta.env.VITE_API_URL ?? 'https://dummyjson.com';
const AUTH_TOKEN_KEY = 'shirtstore.authToken.v1';

export class ApiError extends Error {
  constructor(message, { status, statusText, path } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status ?? null;
    this.statusText = statusText ?? null;
    this.path = path ?? null;
  }
}

function getAuthToken() {
  try {
    return typeof window === 'undefined'
      ? null
      : window.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Minimal fetch wrapper for the current storefront/backend API.
 * Attaches stored auth token when available.
 */
export async function apiRequest(path, options = {}) {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let detail;
    try {
      const data = await response.json();
      detail = data?.detail || data?.message;
    } catch {
      detail = null;
    }

    if (response.status === 401 && token) {
      try {
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
      } catch {
        // ignore
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shirtstore:auth-expired'));
      }
    }

    throw new ApiError(
      detail || `API request failed (${response.status} ${response.statusText})`,
      {
        status: response.status,
        statusText: response.statusText,
        path,
      },
    );
  }

  if (response.status === 204) return null;
  return response.json();
}

export function getApiUrl() {
  return API_URL;
}
