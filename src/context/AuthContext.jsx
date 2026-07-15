/**
 * AuthContext.jsx
 * Path: src/context/AuthContext.jsx
 * Description: Authentication context for user state management
 * Changes:
 * - ✅ FIXED: Added debug logs for token storage
 * - ✅ FIXED: Better role handling
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authApi } from "../services/authApi";
import { storage } from "../utils/storage";
import debug from "../utils/debug";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = storage.getToken();
        debug.log("🔐 Token check:", {
          hasToken: !!token,
          token: token?.substring(0, 20) + "...",
        });

        if (token) {
          try {
            const response = await authApi.getMe();
            debug.log("✅ Auth response:", response);

            if (response.success && response.data?.user) {
              const userData = response.data.user;
              setUser(userData);
              setIsAuthenticated(true);
              // ✅ Save user to storage
              storage.setUser(userData);
              debug.log(
                `✅ User authenticated: ${userData.email} (role: ${userData.role})`,
              );
            } else {
              debug.warn("⚠️ Token invalid, clearing auth");
              storage.clearAuth();
              setIsAuthenticated(false);
            }
          } catch (error) {
            debug.warn("⚠️ Auth check failed:", error.message);
            storage.clearAuth();
            setIsAuthenticated(false);
          }
        } else {
          debug.log("🔐 No token found");
          setIsAuthenticated(false);
        }
      } catch (error) {
        debug.error("Failed to load user:", error);
        storage.clearAuth();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      debug.log("🔄 Login response:", response);

      if (response.success) {
        const { user, accessToken } = response.data;

        // ✅ Save auth with both keys
        storage.setAuth({ accessToken, user });

        // ✅ Verify saved
        const savedToken = storage.getToken();
        debug.log("✅ Token saved:", {
          hasToken: !!savedToken,
          token: savedToken?.substring(0, 20) + "...",
          userRole: user?.role,
        });

        setUser(user);
        setIsAuthenticated(true);
        debug.log(`✅ Login successful: ${user.email} (role: ${user.role})`);
        return { success: true, user };
      }
      return { success: false, error: response.message };
    } catch (error) {
      debug.error("Login error:", error);
      return { success: false, error: error.message };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const response = await authApi.register(userData);
      if (response.success) {
        const { user, accessToken } = response.data;
        storage.setAuth({ accessToken, user });
        setUser(user);
        setIsAuthenticated(true);
        debug.log(`✅ Register successful: ${user.email} (role: ${user.role})`);
        return { success: true, user };
      }
      return { success: false, error: response.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      debug.error("Logout error:", error);
    } finally {
      storage.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    storage.setUser(updatedUser);
  }, []);

  // Refresh user data from backend (after XP changes, profile updates, etc.)
  // This re-fetches /auth/me and updates the AuthContext state so all
  // components using useAuth() see fresh data (xp, level, streak, etc.)
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

  const value = {
    user,
    setUser,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

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
