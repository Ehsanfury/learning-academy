/**
 * storage.js
 * Path: src/utils/storage.js
 * Description: Storage utilities with secure token management
 * Changes:
 * - ✅ FIXED: Added backward compatibility for 'token' key
 * - ✅ FIXED: Both 'token' and 'access_token' work
 * - ✅ FIXED: Added debug logs
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  TOKEN: "token", // ✅ Backward compatibility
  USER: "user",
  THEME: "theme",
  LANGUAGE: "german_academy_language",
};

const USE_SESSION_STORAGE = false;

const getStorage = () => {
  return USE_SESSION_STORAGE ? sessionStorage : localStorage;
};

export const storage = {
  // ============================================
  // 🔑 Token Management
  // ============================================

  getToken: () => {
    // ✅ Try both keys for backward compatibility
    const token =
      getStorage().getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
      getStorage().getItem(STORAGE_KEYS.TOKEN);

    // ✅ Sync both keys if needed
    if (token) {
      getStorage().setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      getStorage().setItem(STORAGE_KEYS.TOKEN, token);
    }

    return token;
  },

  setToken: (token) => {
    if (token) {
      // ✅ Save to both keys for compatibility
      getStorage().setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      getStorage().setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      getStorage().removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      getStorage().removeItem(STORAGE_KEYS.TOKEN);
    }
  },

  removeToken: () => {
    getStorage().removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    getStorage().removeItem(STORAGE_KEYS.TOKEN);
  },

  getRefreshToken: () => {
    return null;
  },

  setRefreshToken: (token) => {
    // No-op for security
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
      // ✅ Save to both keys
      getStorage().setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      getStorage().setItem(STORAGE_KEYS.TOKEN, accessToken);
    }
    if (user) {
      getStorage().setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }

    // ✅ Debug log
    console.log("🔐 Auth saved:", {
      hasToken: !!accessToken,
      hasUser: !!user,
      userRole: user?.role,
      tokenKey: STORAGE_KEYS.ACCESS_TOKEN,
      tokenExists: !!getStorage().getItem(STORAGE_KEYS.ACCESS_TOKEN),
    });
  },

  clearAuth: () => {
    getStorage().removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    getStorage().removeItem(STORAGE_KEYS.TOKEN);
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
