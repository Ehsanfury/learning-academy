/**
 * AuthContext.test.jsx
 * Path: src/context/__tests__/AuthContext.test.jsx
 * Description: Tests for AuthContext
 * Version: 1.0 - New test file
 * Coverage:
 * - ✅ Initial state
 * - ✅ Login flow
 * - ✅ Register flow
 * - ✅ Logout flow
 * - ✅ updateUser function
 * - ✅ refreshUser function
 * - ✅ Error handling
 * - ✅ Token persistence
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";

// ============================================
// 🎭 Mocks
// ============================================

vi.mock("../../services/authApi", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
  },
}));

vi.mock("../../utils/storage", () => ({
  storage: {
    getToken: vi.fn(),
    setAuth: vi.fn(),
    clearAuth: vi.fn(),
    setUser: vi.fn(),
    getUser: vi.fn(),
  },
}));

vi.mock("../../utils/debug", () => ({
  default: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { authApi } from "../services/authApi";
import { storage } from "../utils/storage";

// ============================================
// 🧪 Test Wrapper
// ============================================

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

// ============================================
// 🧪 Tests
// ============================================

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage.getToken.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================
  // 📊 Initial State
  // ============================================

  describe("Initial state", () => {
    it("should have initial loading state as true", () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should set loading to false after checking token", async () => {
      storage.getToken.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  // ============================================
  // 🔑 Login
  // ============================================

  describe("Login", () => {
    it("should login successfully with valid credentials", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        role: "user",
      };
      const mockToken = "mock-access-token";

      authApi.login.mockResolvedValue({
        success: true,
        data: { user: mockUser, accessToken: mockToken },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login(
          "test@example.com",
          "password",
        );
      });

      expect(authApi.login).toHaveBeenCalledWith(
        "test@example.com",
        "password",
      );
      expect(storage.setAuth).toHaveBeenCalledWith({
        accessToken: mockToken,
        user: mockUser,
      });
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(loginResult).toEqual({ success: true, user: mockUser });
    });

    it("should handle login failure with invalid credentials", async () => {
      authApi.login.mockResolvedValue({
        success: false,
        message: "Invalid credentials",
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login("test@example.com", "wrong");
      });

      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
      expect(loginResult).toEqual({
        success: false,
        error: "Invalid credentials",
      });
    });

    it("should handle network errors during login", async () => {
      authApi.login.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login(
          "test@example.com",
          "password",
        );
      });

      expect(loginResult).toEqual({
        success: false,
        error: "Network error",
      });
    });
  });

  // ============================================
  // 📝 Register
  // ============================================

  describe("Register", () => {
    it("should register successfully", async () => {
      const mockUser = {
        id: 1,
        email: "new@example.com",
        role: "user",
      };

      authApi.register.mockResolvedValue({
        success: true,
        data: { user: mockUser, accessToken: "token" },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let registerResult;
      await act(async () => {
        registerResult = await result.current.register({
          email: "new@example.com",
          password: "password",
          name: "Test User",
        });
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(registerResult).toEqual({ success: true, user: mockUser });
    });
  });

  // ============================================
  // 🚪 Logout
  // ============================================

  describe("Logout", () => {
    it("should logout and clear auth", async () => {
      authApi.logout.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(authApi.logout).toHaveBeenCalled();
      expect(storage.clearAuth).toHaveBeenCalled();
      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should clear auth even if logout API fails", async () => {
      authApi.logout.mockRejectedValue(new Error("Logout failed"));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(storage.clearAuth).toHaveBeenCalled();
      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  // ============================================
  // 🔄 updateUser
  // ============================================

  describe("updateUser", () => {
    it("should update user state and storage", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updatedUser = { id: 1, name: "Updated Name", xp: 100 };

      await act(async () => {
        result.current.updateUser(updatedUser);
      });

      expect(result.current.user).toEqual(updatedUser);
      expect(storage.setUser).toHaveBeenCalledWith(updatedUser);
    });
  });

  // ============================================
  // 🔄 refreshUser
  // ============================================

  describe("refreshUser", () => {
    it("should refresh user data from backend", async () => {
      const mockUser = { id: 1, email: "test@example.com", xp: 200 };

      authApi.getMe.mockResolvedValue({
        success: true,
        data: { user: mockUser },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let refreshedUser;
      await act(async () => {
        refreshedUser = await result.current.refreshUser();
      });

      expect(authApi.getMe).toHaveBeenCalled();
      expect(result.current.user).toEqual(mockUser);
      expect(storage.setUser).toHaveBeenCalledWith(mockUser);
      expect(refreshedUser).toEqual(mockUser);
    });

    it("should return null on refresh failure", async () => {
      authApi.getMe.mockRejectedValue(new Error("Failed"));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let refreshedUser;
      await act(async () => {
        refreshedUser = await result.current.refreshUser();
      });

      expect(refreshedUser).toBe(null);
    });
  });

  // ============================================
  // 📡 Token persistence on mount
  // ============================================

  describe("Token persistence", () => {
    it("should load user from valid token on mount", async () => {
      const mockUser = { id: 1, email: "test@example.com" };

      storage.getToken.mockReturnValue("valid-token");
      authApi.getMe.mockResolvedValue({
        success: true,
        data: { user: mockUser },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isLoading).toBe(false);
    });

    it("should clear auth on invalid token", async () => {
      storage.getToken.mockReturnValue("invalid-token");
      authApi.getMe.mockResolvedValue({ success: false });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(storage.clearAuth).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  // ============================================
  // ⚠️ Hook validation
  // ============================================

  describe("Hook validation", () => {
    it("should throw error when used outside provider", () => {
      const consoleError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuth must be used within AuthProvider");

      console.error = consoleError;
    });
  });
});
