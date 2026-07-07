/**
 * storage.js
 * Path: src/utils/storage.js
 * Description: Storage utilities with secure token management
 * Changes:
 * - ✅ Added getRefreshToken() method for compatibility
 * - ✅ But it returns null (refresh token is in httpOnly cookie)
 * - ✅ Fixed all storage methods
 * - ✅ Added missing STORAGE_KEYS exports
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  USER: "user",
  THEME: "theme",
  LANGUAGE: "german_academy_language",
};

export const storage = {
  // ============================================
  // 🔑 Token Management
  // ============================================

  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  setToken: (token) => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
  },

  removeToken: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  // ✅ FIXED: Added getRefreshToken() method
  // Returns null because refresh token is in httpOnly cookie
  getRefreshToken: () => {
    // ❌ Refresh token is NOT stored in localStorage
    // It's stored in httpOnly cookie for security
    return null;
  },

  // ✅ FIXED: Added setRefreshToken() method (no-op)
  setRefreshToken: (token) => {
    // ❌ Refresh token should NOT be stored in localStorage
    // It's stored in httpOnly cookie by the backend
    // This is a no-op for security
  },

  // ============================================
  // 👤 User Management
  // ============================================

  getUser: () => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    if (user) {
      try {
        return JSON.parse(user);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  removeUser: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  updateUser: (updatedUser) => {
    const currentUser = storage.getUser();
    if (currentUser) {
      storage.setUser({ ...currentUser, ...updatedUser });
    } else {
      storage.setUser(updatedUser);
    }
  },

  // ============================================
  // 🔐 Auth Management
  // ============================================

  setAuth: ({ accessToken, user }) => {
    if (accessToken) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    }
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  },

  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  isAuthenticated: () => {
    return !!storage.getToken();
  },

  // ============================================
  // 🎨 Theme Management
  // ============================================

  getTheme: () => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || "light";
  },

  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  // ============================================
  // 🌐 Language Management
  // ============================================

  getLanguage: () => {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || "fa";
  },

  setLanguage: (lang) => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  },

  // ============================================
  // 🧹 Utility
  // ============================================

  clearAll: () => {
    localStorage.clear();
  },
};

// ✅ Export STORAGE_KEYS for use in other files
export { STORAGE_KEYS };

export default storage;
