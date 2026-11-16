import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  RECENTLY_VIEWED_KEY,
  loadRecentlyViewed,
  trackRecentlyViewed as trackItem,
} from '../store/recentlyViewedStorage';

function subscribe(callback) {
  if (typeof window === 'undefined') return () => {};

  const onStorage = (event) => {
    if (event.key === null || event.key === RECENTLY_VIEWED_KEY) {
      callback();
    }
  };
  const onLocalChange = () => callback();

  window.addEventListener('storage', onStorage);
  window.addEventListener('recently-viewed-change', onLocalChange);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('recently-viewed-change', onLocalChange);
  };
}

function notifyLocal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('recently-viewed-change'));
  }
}

export function useRecentlyViewed(excludeId) {
  const items = useSyncExternalStore(subscribe, loadRecentlyViewed, () => []);

  const filtered = useMemo(
    () =>
      excludeId ? items.filter((item) => item.id !== Number(excludeId)) : items,
    [items, excludeId],
  );

  const track = useCallback((product) => {
    trackItem(product);
    notifyLocal();
  }, []);

  return { items: filtered, track };
}
