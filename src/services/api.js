/**
 * api.js
 * Path: src/services/api.js
 * Description: Axios instance with authentication
 * Changes:
 * - ✅ Added withCredentials: true for httpOnly cookie support
 * - ✅ Fixed refresh token endpoint path
 * - ✅ Removed storage.getRefreshToken() call
 * - ✅ Proper error handling for 401 responses
 */

import axios from "axios";
import { storage } from "../utils/storage";
import debug from "../utils/debug";

// ============================================
// 📦 Axios Instance
// ============================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  // ✅ FIXED: withCredentials for httpOnly cookie
  withCredentials: true,
});

// ============================================
// 🔄 Request Interceptor
// ============================================

api.interceptors.request.use(
  (config) => {
    // ✅ Only add access token from localStorage
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ============================================
// 🔄 Response Interceptor
// ============================================

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ FIXED: Check for 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite loops
      if (isRefreshing) {
        // Queue the request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ✅ FIXED: Correct endpoint path (matches backend)
        // Backend: POST /api/auth/refresh-token
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true, // ✅ Send httpOnly cookie
          },
        );

        if (response.data?.success) {
          const { accessToken } = response.data.data || {};
          if (accessToken) {
            storage.setToken(accessToken);
          }

          // Process queued requests
          processQueue(null, accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }

        throw new Error("Refresh failed");
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect to login
        processQueue(refreshError, null);
        storage.clearAuth();

        // Redirect to login if not already there
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
