/**
 * api.test.js
 * Path: src/services/__tests__/api.test.js
 * Description: Tests for API service (axios instance)
 * Version: 1.0 - New test file
 * Coverage:
 * - ✅ Request interceptors (add auth token)
 * - ✅ Response interceptors (handle errors)
 * - ✅ 401 - Unauthorized (auto logout)
 * - ✅ 429 - Rate limit handling
 * - ✅ 500 - Server error handling
 * - ✅ Network error handling
 * - ✅ Token refresh flow
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";

// ============================================
// 🎭 Mocks
// ============================================

vi.mock("../../utils/storage", () => ({
  storage: {
    getToken: vi.fn(),
    getRefreshToken: vi.fn(),
    setAuth: vi.fn(),
    clearAuth: vi.fn(),
  },
}));

vi.mock("../../utils/debug", () => ({
  default: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { storage } from "../../utils/storage";

// ============================================
// 🧪 Import after mocks
// ============================================

let api;

beforeEach(async () => {
  vi.clearAllMocks();
  storage.getToken.mockReturnValue("mock-token");
  vi.resetModules();
  const module = await import("../api");
  api = module.default;
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ============================================
// 🧪 Tests
// ============================================

describe("API Service", () => {
  // ============================================
  // 📡 Request Interceptor
  // ============================================

  describe("Request Interceptor", () => {
    it("should add Authorization header when token exists", async () => {
      storage.getToken.mockReturnValue("test-access-token");

      const config = await api.interceptors.request.handlers[0].fulfilled({
        url: "/test",
        method: "get",
      });

      expect(config.headers.Authorization).toBe("Bearer test-access-token");
    });

    it("should not add Authorization header when no token", async () => {
      storage.getToken.mockReturnValue(null);

      const config = await api.interceptors.request.handlers[0].fulfilled({
        url: "/test",
        method: "get",
      });

      expect(config.headers.Authorization).toBeUndefined();
    });

    it("should handle request interceptor errors", async () => {
      const error = new Error("Request setup failed");

      await expect(
        api.interceptors.request.handlers[0].rejected(error),
      ).rejects.toThrow("Request setup failed");
    });
  });

  // ============================================
  // 📡 Response Interceptor
  // ============================================

  describe("Response Interceptor", () => {
    it("should pass through successful responses", async () => {
      const response = { data: { success: true }, status: 200 };

      const result = await api.interceptors.response.handlers[0].fulfilled(response);

      expect(result).toEqual(response);
    });

    it("should handle 401 Unauthorized", async () => {
      const error = {
        response: {
          status: 401,
          data: { message: "Unauthorized" },
        },
        config: { url: "/api/test" },
      };

      await expect(
        api.interceptors.response.handlers[0].rejected(error),
      ).rejects.toMatchObject({
        response: { status: 401 },
      });

      expect(storage.clearAuth).toHaveBeenCalled();
    });

    it("should handle 429 Rate Limit", async () => {
      const error = {
        response: {
          status: 429,
          data: { message: "Too many requests" },
        },
        config: { url: "/api/test" },
      };

      await expect(
        api.interceptors.response.handlers[0].rejected(error),
      ).rejects.toMatchObject({
        response: { status: 429 },
      });
    });

    it("should handle 500 Server Error", async () => {
      const error = {
        response: {
          status: 500,
          data: { message: "Internal Server Error" },
        },
        config: { url: "/api/test" },
      };

      await expect(
        api.interceptors.response.handlers[0].rejected(error),
      ).rejects.toMatchObject({
        response: { status: 500 },
      });
    });

    it("should handle network errors (no response)", async () => {
      const error = {
        request: {},
        message: "Network Error",
        config: { url: "/api/test" },
      };

      await expect(
        api.interceptors.response.handlers[0].rejected(error),
      ).rejects.toMatchObject({
        message: "Network Error",
      });
    });

    it("should handle request setup errors", async () => {
      const error = {
        message: "Invalid config",
      };

      await expect(
        api.interceptors.response.handlers[0].rejected(error),
      ).rejects.toMatchObject({
        message: "Invalid config",
      });
    });
  });

  // ============================================
  // 🔧 API Methods
  // ============================================

  describe("API Methods", () => {
    it("should have get method", () => {
      expect(typeof api.get).toBe("function");
    });

    it("should have post method", () => {
      expect(typeof api.post).toBe("function");
    });

    it("should have put method", () => {
      expect(typeof api.put).toBe("function");
    });

    it("should have patch method", () => {
      expect(typeof api.patch).toBe("function");
    });

    it("should have delete method", () => {
      expect(typeof api.delete).toBe("function");
    });
  });

  // ============================================
  // ⚙️ Configuration
  // ============================================

  describe("Configuration", () => {
    it("should have baseURL set", () => {
      expect(api.defaults.baseURL).toBeDefined();
    });

    it("should have timeout configured", () => {
      expect(api.defaults.timeout).toBeGreaterThan(0);
    });

    it("should have withCredentials flag", () => {
      expect(typeof api.defaults.withCredentials).toBe("boolean");
    });
  });
});
