/**
 * api.js
 * Path: src/services/api.js
 * Description: Axios instance with authentication
 * Changes:
 * - ✅ ADDED: Debug logs for token
 * - ✅ FIXED: Better 401 handling
 */

import axios from "axios";
import { storage } from "../utils/storage";
import debug from "../utils/debug";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ============================================
// 🔄 Request Interceptor - ✅ ADDED DEBUG
// ============================================

api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();

    // ✅ Debug log
    console.log("🔐 [API Request] URL:", config.url);
    console.log("🔐 [API Request] Has Token:", !!token);
    console.log(
      "🔐 [API Request] Token:",
      token ? token.substring(0, 20) + "..." : "null",
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔐 [API Request] Authorization header set");
    } else {
      console.warn("⚠️ [API Request] No token found!");
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

    // ✅ Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("⚠️ [API] 401 Unauthorized for:", originalRequest.url);

      // ✅ Skip if already on login page
      if (window.location.pathname === "/login") {
        return Promise.reject(error);
      }

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
        console.log("🔄 [API] Refreshing token...");

        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        if (response.data?.success) {
          const { accessToken } = response.data.data || {};
          if (accessToken) {
            storage.setToken(accessToken);
            console.log("✅ [API] Token refreshed successfully");
          }
          processQueue(null, accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }

        throw new Error("Refresh failed");
      } catch (refreshError) {
        console.error("❌ [API] Refresh failed:", refreshError);
        processQueue(refreshError, null);
        storage.clearAuth();

        // ✅ Redirect to login
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ✅ Handle 404 errors gracefully
    if (error.response?.status === 404) {
      debug.warn(`⚠️ API endpoint not found: ${error.config?.url}`);
    }

    return Promise.reject(error);
  },
);

export default api;
