import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchMe, login, register, setStoredToken } from '../services/authService';

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return { user: null };
    try {
      const user = await fetchMe(token);
      return { user, token };
    } catch (error) {
      setStoredToken(null);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Authentication expired.',
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await login(credentials);
      setStoredToken(data.access_token);
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Login failed.',
      );
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await register(payload);
      setStoredToken(data.access_token);
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Registration failed.',
      );
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    status: 'idle',
    error: null,
    initialized: false,
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
      state.initialized = true;
      setStoredToken(null);
    },
    clearAuthError(state) {
      state.error = null;
    },
    hydrateToken(state, action) {
      state.token = action.payload || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        state.initialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Login failed.';
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        state.initialized = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Registration failed.';
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user ?? null;
        if (!action.payload.user) state.token = null;
        state.initialized = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.token = null;
        state.user = null;
        state.initialized = true;
      });
  },
});

export const { logout, clearAuthError, hydrateToken } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export const selectAuthUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.token && state.auth.user);
export const selectAuthInitialized = (state) => Boolean(state.auth.initialized);
export default authSlice.reducer;
