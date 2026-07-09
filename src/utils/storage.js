/**
 * storage.js
 * Path: src/utils/storage.js
 * Description: Storage utilities with secure token management
 * Changes:
 * - ✅ Added getRefreshToken() method for compatibility
 * - ✅ But it returns null (refresh token is in httpOnly cookie)
 * - ✅ Fixed all storage methods
 * - ✅ Added missing STORAGE_KEYS exports
 * - ✅ NEW: Added useSessionStorage flag for session persistence
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  USER: "user",
  THEME: "theme",
  LANGUAGE: "german_academy_language",
};

// ✅ NEW: Choose persistence type
// true = sessionStorage (cleared when browser closed)
// false = localStorage (persistent)
const USE_SESSION_STORAGE = false; // ✅ Default: persistent (like now)

const getStorage = () => {
  return USE_SESSION_STORAGE ? sessionStorage : localStorage;
};

export const storage = {
  // ============================================
  // 🔑 Token Management
  // ============================================

  getToken: () => {
    return getStorage().getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  setToken: (token) => {
    if (token) {
      getStorage().setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } else {
      getStorage().removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
  },

  removeToken: () => {
    getStorage().removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  // ✅ FIXED: Added getRefreshToken() method
  getRefreshToken: () => {
    // ❌ Refresh token is NOT stored in localStorage
    // It's stored in httpOnly cookie for security
    return null;
  },

  setRefreshToken: (token) => {
    // ❌ Refresh token should NOT be stored in localStorage
    // This is a no-op for security
  },

  // ============================================
  // 👤 User Management
  // ============================================

  getUser: () => {
    const user = getStorage().getItem(STORAGE_KEYS.USER);
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
      getStorage().setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      getStorage().removeItem(STORAGE_KEYS.USER);
    }
  },

  removeUser: () => {
    getStorage().removeItem(STORAGE_KEYS.USER);
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
      getStorage().setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    }
    if (user) {
      getStorage().setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  },

  clearAuth: () => {
    getStorage().removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    getStorage().removeItem(STORAGE_KEYS.USER);
  },

  isAuthenticated: () => {
    return !!storage.getToken();
  },

  // ============================================
  // 🎨 Theme Management
  // ============================================

  getTheme: () => {
    return getStorage().getItem(STORAGE_KEYS.THEME) || "light";
  },

  setTheme: (theme) => {
    getStorage().setItem(STORAGE_KEYS.THEME, theme);
  },

  // ============================================
  // 🌐 Language Management
  // ============================================

  getLanguage: () => {
    return getStorage().getItem(STORAGE_KEYS.LANGUAGE) || "fa";
  },

  setLanguage: (lang) => {
    getStorage().setItem(STORAGE_KEYS.LANGUAGE, lang);
  },

  // ============================================
  // 🧹 Utility
  // ============================================

  clearAll: () => {
    getStorage().clear();
  },
};

export { STORAGE_KEYS };
export default storage;
