/**
 * authApi.js
 * Path: src/services/authApi.js
 * Description: Authentication API service
 * Changes:
 * - ✅ FIXED: logout now properly handles errors
 * - ✅ FIXED: clearAuth always called on logout
 */

import api from "./api";
import { storage } from "../utils/storage";
import debug from "../utils/debug";

/**
 * Authentication API service
 */
export const authApi = {
  // ============================================
  // 🔐 Authentication
  // ============================================

  /**
   * Login user
   */
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.data?.success) {
        const { accessToken, user } = response.data.data || response.data;
        storage.setAuth({ accessToken, user });
        debug.log("✅ Login successful:", {
          email: user?.email,
          role: user?.role,
        });
      }

      return response.data;
    } catch (error) {
      debug.error("Login error:", error);
      throw error;
    }
  },

  /**
   * Register new user
   */
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);

      if (response.data?.success) {
        const { accessToken, user } = response.data.data || response.data;
        storage.setAuth({ accessToken, user });
        debug.log("✅ Register successful:", { email: user?.email });
      }

      return response.data;
    } catch (error) {
      debug.error("Register error:", error);
      throw error;
    }
  },

  /**
   * Logout user - ✅ FIXED
   */
  logout: async () => {
    try {
      debug.log("🔄 Logging out...");
      await api.post("/auth/logout");
      debug.log("✅ Logout API call successful");
    } catch (error) {
      debug.error("Logout API error:", error);
      // ✅ Continue with local cleanup even if API fails
    } finally {
      // ✅ ALWAYS clear local storage
      storage.clearAuth();
      debug.log("✅ Auth cleared from storage");
    }
  },

  /**
   * Get current user from API
   */
  getMe: async () => {
    try {
      const response = await api.get("/auth/me");
      if (response.data?.success && response.data?.data?.user) {
        storage.setUser(response.data.data.user);
      }
      return response.data;
    } catch (error) {
      debug.error("Get me error:", error);
      throw error;
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    try {
      const response = await api.post("/auth/refresh");

      if (response.data?.success) {
        const { accessToken } = response.data.data || response.data;
        if (accessToken) {
          storage.setToken(accessToken);
          debug.log("✅ Token refreshed");
        }
      }

      return response.data;
    } catch (error) {
      debug.error("Refresh token error:", error);
      storage.clearAuth();
      throw error;
    }
  },

  // ============================================
  // 🔑 Password Management
  // ============================================

  forgotPassword: async (email) => {
    return api.post("/auth/forgot-password", { email });
  },

  resetPassword: async (token, newPassword) => {
    return api.post("/auth/reset-password", { token, newPassword });
  },

  changePassword: async (currentPassword, newPassword) => {
    return api.post("/auth/change-password", { currentPassword, newPassword });
  },
};

export default authApi;
