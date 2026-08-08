import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Create a single Axios instance for the entire app.
// All API calls should use this instance instead of raw `axios`.
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ───────────────────────────────────────────
// Automatically attaches the Bearer token from Zustand auth store
// to every outgoing request. This eliminates the need to manually
// pass `headers: { Authorization: ... }` in every component.
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────
// Handles 401 responses globally:
//   - Clears the auth store (logs out the user)
//   - Redirects to the login page
// This prevents stale tokens from causing cascading 401 errors.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      // Don't redirect if already on login page or if this IS the login request
      if (currentPath !== '/login' && !error.config?.url?.includes('/auth/login')) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
