import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProductById,
  selectProductDetail,
} from '../store/productSlice';

/**
 * Loads one product and exposes its status to the detail page. The thunk's
 * condition caches successful results, so revisiting a product is instant.
 */
export function useProductDetail(id) {
  const dispatch = useDispatch();
  const detail = useSelector(selectProductDetail);

  useEffect(() => {
    if (Number.isInteger(id) && id > 0) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  return {
    item: detail.item,
    status: detail.status,
    error: detail.error,
    requestedId: detail.requestedId,
    isLoading: detail.status === 'idle' || detail.status === 'loading',
    isError: detail.status === 'failed',
    retry: () => dispatch(fetchProductById(id)),
  };
}
