import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { getCatalogue } from '../api/productApi';

/**
 * Loads the curated clothing catalogue once and caches it in Redux.
 *
 * The `condition` option is important: several components ask for the
 * catalogue on mount, and React StrictMode intentionally runs effects twice
 * in development. The condition prevents duplicate network requests while
 * still allowing a retry after a failure (or an explicit refresh).
 */
export const fetchCatalogue = createAsyncThunk(
  'products/fetchCatalogue',
  async (_, { rejectWithValue }) => {
    try {
      return await getCatalogue();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Unable to load the catalogue.',
      );
    }
  },
  {
    condition: (forceRefresh, { getState }) => {
      if (forceRefresh) return true;

      const { status } = getState().products;
      return status !== 'loading' && status !== 'succeeded';
    },
  },
);

const initialState = {
  items: [],
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogue.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCatalogue.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCatalogue.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unable to load the catalogue.';
      });
  },
});

export const selectCatalogueItems = (state) => state.products.items;
export const selectCatalogueStatus = (state) => state.products.status;
export const selectCatalogueError = (state) => state.products.error;

/**
 * Derived category data for the home page and catalogue filters. The first
 * product thumbnail is used as a representative category image, so the home
 * page does not need a second hardcoded image list.
 */
export const selectCategories = createSelector(
  [selectCatalogueItems],
  (items) => {
    const categories = new Map();

    for (const product of items) {
      if (!categories.has(product.category)) {
        categories.set(product.category, product.thumbnail);
      }
    }

    return [...categories.entries()]
      .map(([slug, image]) => ({ slug, image }))
      .sort((a, b) => a.slug.localeCompare(b.slug));
  },
);

export const selectCategorySlugs = createSelector(
  [selectCategories],
  (categories) => categories.map((category) => category.slug),
);

export default productSlice.reducer;
