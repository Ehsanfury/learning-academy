/**
 * authApi.js
 * Path: src/services/authApi.js
 * Description: Authentication API service
 * Changes:
 * - ✅ Removed refresh token from localStorage
 * - ✅ Only access token used for authentication
 * - ✅ Refresh handled via httpOnly cookie
 * - ✅ FIXED: changePassword endpoint path to match backend
 * - ✅ Backend: POST /api/auth/change-password
 */

import api from "./api";
import { storage } from "../utils/storage";

/**
 * Authentication API service
 */
export const authApi = {
  // ============================================
  // 🔐 Authentication
  // ============================================

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Response with user and access token
   */
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.data?.success) {
        const { accessToken, user } = response.data.data || response.data;
        storage.setAuth({ accessToken, user });
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise} Response with user and access token
   */
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);

      if (response.data?.success) {
        const { accessToken, user } = response.data.data || response.data;
        storage.setAuth({ accessToken, user });
      }

      return response.data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  },

  /**
   * Logout user
   * @returns {Promise} Response
   */
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      storage.clearAuth();
    }
  },

  /**
   * Get current user from API
   * @returns {Promise} Response with user data
   */
  getMe: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Get me error:", error);
      throw error;
    }
  },

  /**
   * Refresh access token
   * Uses httpOnly cookie for refresh token
   * @returns {Promise} Response with new access token
   */
  refreshToken: async () => {
    try {
      const response = await api.post("/auth/refresh");

      if (response.data?.success) {
        const { accessToken } = response.data.data || response.data;
        if (accessToken) {
          storage.setToken(accessToken);
        }
      }

      return response.data;
    } catch (error) {
      storage.clearAuth();
      console.error("Refresh token error:", error);
      throw error;
    }
  },

  // ============================================
  // 🔑 Password Management
  // ============================================

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} Response
   */
  forgotPassword: async (email) => {
    return api.post("/auth/forgot-password", { email });
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise} Response
   */
  resetPassword: async (token, newPassword) => {
    return api.post("/auth/reset-password", { token, newPassword });
  },

  /**
   * Change password (authenticated)
   * ✅ FIXED: Correct endpoint path
   */
  changePassword: async (currentPassword, newPassword) => {
    return api.post("/auth/change-password", { currentPassword, newPassword });
  },
};

export default authApi;
