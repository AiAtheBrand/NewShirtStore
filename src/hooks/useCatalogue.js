import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCatalogue,
  selectCatalogueError,
  selectCatalogueItems,
  selectCatalogueStatus,
} from '../store/productSlice';

/**
 * Shared catalogue access. Components can call this hook independently;
 * the thunk's `condition` makes sure the network request still happens once.
 */
export function useCatalogue() {
  const dispatch = useDispatch();
  const items = useSelector(selectCatalogueItems);
  const status = useSelector(selectCatalogueStatus);
  const error = useSelector(selectCatalogueError);

  useEffect(() => {
    dispatch(fetchCatalogue());
  }, [dispatch]);

  return {
    items,
    status,
    error,
    isLoading: status === 'idle' || status === 'loading',
    isError: status === 'failed',
    retry: () => dispatch(fetchCatalogue(true)),
  };
}
