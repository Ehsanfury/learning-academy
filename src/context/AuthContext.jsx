/**
 * AuthContext.jsx
 * Path: src/context/AuthContext.jsx
 * Description: Authentication context for user state management
 * Changes:
 * - ✅ Removed 5 second debug delay
 * - ✅ Cleaned up logging
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
        if (token) {
          const response = await authApi.getMe();
          if (response.success && response.data.user) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            storage.clearAuth();
          }
        }
      } catch (error) {
        debug.error("Failed to load user:", error);
        storage.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await authApi.login(email, password);
    if (response.success) {
      const { user, accessToken } = response.data;
      storage.setAuth({ accessToken, user });
      setUser(user);
      setIsAuthenticated(true);
      return { success: true, user };
    }
    return { success: false, error: response.message };
  }, []);

  const register = useCallback(async (userData) => {
    const response = await authApi.register(userData);
    if (response.success) {
      const { user, accessToken } = response.data;
      storage.setAuth({ accessToken, user });
      setUser(user);
      setIsAuthenticated(true);
      return { success: true, user };
    }
    return { success: false, error: response.message };
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
    storage.updateUser(updatedUser);
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
