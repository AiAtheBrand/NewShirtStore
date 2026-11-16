const API_URL = import.meta.env.VITE_API_URL ?? 'https://dummyjson.com';

export class ApiError extends Error {
  constructor(message, { status, statusText, path } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status ?? null;
    this.statusText = statusText ?? null;
    this.path = path ?? null;
  }
}

/**
 * Minimal fetch wrapper for the current storefront data source.
 * When a backend is introduced, this is the seam to swap for authenticated
 * requests, base URL changes, interceptors, or a generated client.
 */
export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new ApiError(
      `API request failed (${response.status} ${response.statusText})`,
      {
        status: response.status,
        statusText: response.statusText,
        path,
      },
    );
  }

  return response.json();
}

export function getApiUrl() {
  return API_URL;
}
