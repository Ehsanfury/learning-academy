/**
 * AuthContext.jsx
 * Path: src/context/AuthContext.jsx
 * Description: Authentication context
 * Changes:
 * - ✅ FIXED: logout now properly clears state
 * - ✅ FIXED: better error handling for token validation
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { authApi } from "../services/authApi";
import { storage } from "../utils/storage";
import debug from "../utils/debug";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  // ============================================
  // 📡 Load user from token on mount
  // ============================================

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = storage.getToken();

        debug.log("🔐 Token check:", {
          hasToken: !!token,
          token: token?.substring(0, 20) + "...",
        });

        if (!token) {
          debug.log("🔐 No token found");
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        try {
          const response = await authApi.getMe();

          if (response.success && response.data?.user) {
            const userData = response.data.user;
            setUser(userData);
            setIsAuthenticated(true);
            storage.setUser(userData);
            debug.log(
              `✅ User authenticated: ${userData.email} (role: ${userData.role})`,
            );
          } else {
            debug.warn("⚠️ Token invalid, clearing auth");
            storage.clearAuth();
            setIsAuthenticated(false);
          }
        } catch (apiError) {
          // ✅ If API returns 401, clear auth
          if (apiError.response?.status === 401) {
            debug.warn("⚠️ Token expired, clearing auth");
            storage.clearAuth();
            setIsAuthenticated(false);
          } else {
            throw apiError;
          }
        }
      } catch (error) {
        debug.error("Failed to load user:", error);
        storage.clearAuth();
        setIsAuthenticated(false);
        setAuthError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // ============================================
  // 🔑 Login
  // ============================================

  const login = useCallback(async (email, password) => {
    try {
      setAuthError(null);
      const response = await authApi.login(email, password);

      if (response.success) {
        const { user, accessToken } = response.data;
        storage.setAuth({ accessToken, user });
        setUser(user);
        setIsAuthenticated(true);
        debug.log(`✅ Login successful: ${user.email} (role: ${user.role})`);
        return { success: true, user };
      }

      setAuthError(response.message);
      return { success: false, error: response.message };
    } catch (error) {
      debug.error("Login error:", error);
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // ============================================
  // 📝 Register
  // ============================================

  const register = useCallback(async (userData) => {
    try {
      setAuthError(null);
      const response = await authApi.register(userData);

      if (response.success) {
        const { user, accessToken } = response.data;
        storage.setAuth({ accessToken, user });
        setUser(user);
        setIsAuthenticated(true);
        debug.log(`✅ Register successful: ${user.email}`);
        return { success: true, user };
      }

      setAuthError(response.message);
      return { success: false, error: response.message };
    } catch (error) {
      debug.error("Register error:", error);
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // ============================================
  // 🚪 Logout - ✅ FIXED
  // ============================================

  const logout = useCallback(async () => {
    try {
      debug.log("🔄 Logging out...");
      await authApi.logout();
    } catch (error) {
      debug.error("Logout error:", error);
    } finally {
      // ✅ ALWAYS clear everything
      storage.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
      debug.log("✅ Logout complete");
    }
  }, []);

  // ============================================
  // 🔄 Update User
  // ============================================

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    storage.setUser(updatedUser);
  }, []);

  // ============================================
  // 🔄 Refresh User
  // ============================================

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        setUser(userData);
        storage.setUser(userData);
        debug.log(`✅ User refreshed: ${userData.email}`);
        return userData;
      }
    } catch (error) {
      debug.error("Failed to refresh user:", error);
    }
    return null;
  }, []);

  // ============================================
  // 🛡️ Role Helpers
  // ============================================

  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";

  // ============================================
  // 📦 Memoized Value
  // ============================================

  const value = useMemo(
    () => ({
      user,
      setUser,
      isAuthenticated,
      isLoading,
      authError,
      login,
      register,
      logout,
      updateUser,
      refreshUser,
      isAdmin,
      isUser,
      clearError: () => setAuthError(null),
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      authError,
      login,
      register,
      logout,
      updateUser,
      refreshUser,
      isAdmin,
      isUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
