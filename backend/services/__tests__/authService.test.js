/**
 * authService.test.js
 * Path: backend/services/__tests__/authService.test.js
 * Description: Tests for authService
 * Version: 1.0 - New test file
 * Coverage:
 * - ✅ Token generation (access, refresh)
 * - ✅ Login flow
 * - ✅ Register flow
 * - ✅ Logout (revoke token)
 * - ✅ Refresh token
 * - ✅ Get user profile
 * - ✅ Email verification
 * - ✅ Password reset
 * - ✅ Change password
 * - ✅ Error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ============================================
// 🎭 Mocks
// ============================================

vi.mock("../../models/index.js", () => ({
  User: {
    findOne: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    findAll: vi.fn(),
  },
  UserRefreshToken: {
    create: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
  },
  XPHistory: { create: vi.fn() },
}));

vi.mock("../../errors/index.js", () => ({
  AppError: class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  },
  UnauthorizedError: class UnauthorizedError extends Error {
    constructor(message) {
      super(message);
      this.statusCode = 401;
    }
  },
  NotFoundError: class NotFoundError extends Error {
    constructor(message) {
      super(message);
      this.statusCode = 404;
    }
  },
  ValidationError: class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.statusCode = 422;
    }
  },
}));

vi.mock("../../config/logger.js", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("../../config/env.js", () => ({
  default: {
    jwt: {
      accessSecret: "test-jwt-secret",
      refreshSecret: "test-refresh-secret",
      accessExpiresIn: "15m",
    },
  },
}));

import { User, UserRefreshToken } from "../../models/index.js";
import authService from "../authService";

// ============================================
// 🧪 Tests
// ============================================

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================
  // 🔑 Token Management
  // ============================================

  describe("Token Management", () => {
    describe("generateAccessToken", () => {
      it("should generate a valid JWT access token", () => {
        const user = { id: 1, email: "test@example.com", role: "user" };
        const token = authService.generateAccessToken(user);

        expect(token).toBeDefined();
        const decoded = jwt.verify(token, "test-jwt-secret");
        expect(decoded.id).toBe(1);
        expect(decoded.email).toBe("test@example.com");
        expect(decoded.role).toBe("user");
      });
    });

    describe("generateRefreshToken", () => {
      it("should generate a refresh token and save hashed version", async () => {
        const user = { id: 1 };
        UserRefreshToken.create.mockResolvedValue({});

        const token = await authService.generateRefreshToken(user);

        expect(token).toBeDefined();
        expect(typeof token).toBe("string");
        expect(UserRefreshToken.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: 1,
            token: expect.any(String),
            expiresAt: expect.any(Date),
          })
        );

        // Token should be hashed
        const callArgs = UserRefreshToken.create.mock.calls[0][0];
        expect(callArgs.token).not.toBe(token);
      });
    });

    describe("validateRefreshToken", () => {
      it("should return token record when valid", async () => {
        const mockTokenRecord = {
          id: 1,
          userId: 1,
          token: "$2a$10$hashedtoken",
        };
        UserRefreshToken.findAll.mockResolvedValue([mockTokenRecord]);
        bcrypt.compare = vi.fn().mockResolvedValue(true);

        const result = await authService.validateRefreshToken(1, "plain-token");

        expect(result).toBe(mockTokenRecord);
      });

      it("should return null when no matching token", async () => {
        UserRefreshToken.findAll.mockResolvedValue([]);
        bcrypt.compare = vi.fn().mockResolvedValue(false);

        const result = await authService.validateRefreshToken(1, "invalid-token");

        expect(result).toBeNull();
      });
    });

    describe("revokeAllRefreshTokens", () => {
      it("should revoke all tokens for user", async () => {
        UserRefreshToken.update.mockResolvedValue([1]);

        await authService.revokeAllRefreshTokens(1);

        expect(UserRefreshToken.update).toHaveBeenCalledWith(
          { isRevoked: true },
          { where: { userId: 1 } }
        );
      });
    });
  });

  // ============================================
  // 🔐 Authentication
  // ============================================

  describe("Authentication", () => {
    describe("login", () => {
      it("should login successfully with valid credentials", async () => {
        const mockUser = {
          id: 1,
          email: "test@example.com",
          role: "user",
          isActive: true,
          comparePassword: vi.fn().mockResolvedValue(true),
          toJSON: () => ({
            id: 1,
            email: "test@example.com",
            role: "user",
          }),
        };
        User.findOne.mockResolvedValue(mockUser);
        UserRefreshToken.create.mockResolvedValue({});

        const result = await authService.login("test@example.com", "password", { ip: "127.0.0.1" });

        expect(result.user.email).toBe("test@example.com");
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
      });

      it("should throw when user not found", async () => {
        User.findOne.mockResolvedValue(null);

        await expect(authService.login("notfound@example.com", "password", {})).rejects.toThrow(
          "Invalid email or password"
        );
      });

      it("should throw when password is incorrect", async () => {
        const mockUser = {
          id: 1,
          email: "test@example.com",
          isActive: true,
          comparePassword: vi.fn().mockResolvedValue(false),
        };
        User.findOne.mockResolvedValue(mockUser);

        await expect(authService.login("test@example.com", "wrong", {})).rejects.toThrow(
          "Invalid email or password"
        );
      });

      it("should throw when account is deactivated", async () => {
        const mockUser = {
          id: 1,
          email: "test@example.com",
          isActive: false,
          comparePassword: vi.fn().mockResolvedValue(true),
        };
        User.findOne.mockResolvedValue(mockUser);

        await expect(authService.login("test@example.com", "password", {})).rejects.toThrow(
          "Account is deactivated"
        );
      });
    });

    describe("register", () => {
      it("should register a new user successfully", async () => {
        const userData = {
          email: "new@example.com",
          password: "password",
          name: "New User",
          username: "newuser",
        };
        User.findOne.mockResolvedValue(null);
        const mockUser = {
          id: 1,
          ...userData,
          toJSON: () => ({ id: 1, ...userData }),
        };
        User.create.mockResolvedValue(mockUser);
        UserRefreshToken.create.mockResolvedValue({});

        const result = await authService.register(userData);

        expect(result.user.email).toBe("new@example.com");
        expect(result.accessToken).toBeDefined();
      });

      it("should throw when user already exists", async () => {
        User.findOne.mockResolvedValue({ id: 1 });

        await expect(
          authService.register({
            email: "existing@example.com",
            password: "password",
          })
        ).rejects.toThrow("User already exists");
      });
    });

    describe("logout", () => {
      it("should revoke refresh token on logout", async () => {
        const mockTokenRecord = {
          update: vi.fn().mockResolvedValue({}),
        };
        UserRefreshToken.findOne.mockResolvedValue(mockTokenRecord);
        bcrypt.compare = vi.fn().mockResolvedValue(true);

        await authService.logout(1, "refresh-token");

        expect(mockTokenRecord.update).toHaveBeenCalledWith({ isRevoked: true });
      });

      it("should return success even without refresh token", async () => {
        const result = await authService.logout(1, null);
        expect(result.success).toBe(true);
      });
    });
  });

  // ============================================
  // 📧 Email Verification
  // ============================================

  describe("Email Verification", () => {
    describe("verifyEmail", () => {
      it("should verify email with valid token", async () => {
        const mockUser = {
          emailVerified: false,
          verificationToken: "token",
          resetPasswordExpires: new Date(Date.now() + 3600000),
          save: vi.fn().mockResolvedValue({}),
        };
        User.findOne.mockResolvedValue(mockUser);

        const result = await authService.verifyEmail("token");

        expect(result.success).toBe(true);
        expect(mockUser.emailVerified).toBe(true);
        expect(mockUser.verificationToken).toBeNull();
      });

      it("should throw with invalid token", async () => {
        User.findOne.mockResolvedValue(null);

        await expect(authService.verifyEmail("invalid")).rejects.toThrow(
          "Invalid or expired verification token"
        );
      });
    });
  });

  // ============================================
  // 🔑 Password Management
  // ============================================

  describe("Password Management", () => {
    describe("forgotPassword", () => {
      it("should generate reset token for existing user", async () => {
        const mockUser = {
          resetPasswordToken: null,
          resetPasswordExpires: null,
          save: vi.fn().mockResolvedValue({}),
        };
        User.findOne.mockResolvedValue(mockUser);

        const result = await authService.forgotPassword("test@example.com");

        expect(result.success).toBe(true);
        expect(mockUser.resetPasswordToken).toBeDefined();
        expect(mockUser.resetPasswordExpires).toBeDefined();
      });

      it("should return success even if user not found (security)", async () => {
        User.findOne.mockResolvedValue(null);

        const result = await authService.forgotPassword("notfound@example.com");

        expect(result.success).toBe(true);
      });
    });

    describe("changePassword", () => {
      it("should change password with valid current password", async () => {
        const mockUser = {
          id: 1,
          comparePassword: vi.fn().mockResolvedValue(true),
          save: vi.fn().mockResolvedValue({}),
        };
        User.findByPk.mockResolvedValue(mockUser);
        UserRefreshToken.destroy.mockResolvedValue(1);

        const result = await authService.changePassword(1, "current", "newpass");

        expect(result.success).toBe(true);
      });

      it("should throw when current password is incorrect", async () => {
        const mockUser = {
          id: 1,
          comparePassword: vi.fn().mockResolvedValue(false),
        };
        User.findByPk.mockResolvedValue(mockUser);

        await expect(authService.changePassword(1, "wrong", "newpass")).rejects.toThrow(
          "Current password is incorrect"
        );
      });
    });
  });

  // ============================================
  // 👤 User Profile
  // ============================================

  describe("getUserProfile", () => {
    it("should return user profile", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        toJSON: () => ({ id: 1, email: "test@example.com" }),
      };
      User.findByPk.mockResolvedValue(mockUser);

      const result = await authService.getUserProfile(1);

      expect(result.email).toBe("test@example.com");
    });

    it("should throw when user not found", async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(authService.getUserProfile(999)).rejects.toThrow("User not found");
    });
  });
});
