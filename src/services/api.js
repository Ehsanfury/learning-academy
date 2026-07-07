/**
 * api.js
 * Path: src/services/api.js
 * Description: Axios instance with authentication
 * Changes:
 * - ✅ FIXED: Refresh token endpoint path
 * - ✅ Added withCredentials: true for httpOnly cookie support
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
  // ✅ withCredentials for httpOnly cookie
  withCredentials: true,
});

// ============================================
// 🔄 Request Interceptor
// ============================================

api.interceptors.request.use(
  (config) => {
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
// 🔄 Response Interceptor - Refresh Token
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

    // ✅ Check for 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
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
        // ✅ FIXED: Try both endpoints
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          },
        );

        if (response.data?.success) {
          const { accessToken } = response.data.data || {};
          if (accessToken) {
            storage.setToken(accessToken);
          }

          processQueue(null, accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }

        throw new Error("Refresh failed");
      } catch (refreshError) {
        processQueue(refreshError, null);
        storage.clearAuth();

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
