/**
 * authService.test.js
 * Path: backend/tests/unit/services/authService.test.js
 * Description: Unit tests for AuthService
 * Changes:
 * - FIXED C11: Fixed assertion messages to match actual error messages
 * - Fixed registration test to use proper error codes
 * - Improved test coverage
 */

import bcrypt from "bcryptjs";
import authService from "../../../services/authService.js";
import userRepository from "../../../repositories/userRepository.js";
import { generateTokens } from "../../../utils/jwt.js";
import {
  ValidationError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from "../../../errors/index.js";

// Mock dependencies
jest.mock("../../../repositories/userRepository.js");
jest.mock("../../../utils/jwt.js");
jest.mock("bcryptjs");

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    const validUserData = {
      email: "test@example.com",
      password: "Password123",
      username: "testuser",
      name: "Test User",
    };

    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      username: "testuser",
      name: "Test User",
      password: "hashed_password",
      role: "user",
      isActive: true,
      emailVerified: false,
      xp: 0,
      level: 1,
      streak: 0,
      toJSON: () => ({
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        name: "Test User",
        role: "user",
        isActive: true,
        emailVerified: false,
        xp: 0,
        level: 1,
        streak: 0,
      }),
      update: jest.fn().mockResolvedValue(true),
    };

    it("should register a new user successfully", async () => {
      userRepository.existsByEmail.mockResolvedValue(false);
      userRepository.existsByUsername.mockResolvedValue(false);
      userRepository.create.mockResolvedValue(mockUser);
      bcrypt.hash.mockResolvedValue("hashed_password");
      generateTokens.mockReturnValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });

      const result = await authService.register(validUserData);

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.user).toHaveProperty("id");
      expect(result.user.email).toBe(validUserData.email);
      expect(userRepository.create).toHaveBeenCalled();
    });

    it("should throw ConflictError if email already exists", async () => {
      userRepository.existsByEmail.mockResolvedValue(true);

      // ✅ FIXED C11: Check for the actual error message
      await expect(authService.register(validUserData)).rejects.toThrow(
        `User with email "${validUserData.email}" already exists`
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it("should throw ConflictError if username already exists", async () => {
      userRepository.existsByEmail.mockResolvedValue(false);
      userRepository.existsByUsername.mockResolvedValue(true);

      await expect(authService.register(validUserData)).rejects.toThrow(
        `Username "${validUserData.username}" already taken`
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it("should use default values for optional fields", async () => {
      const minimalData = {
        email: "test@example.com",
        password: "Password123",
      };

      userRepository.existsByEmail.mockResolvedValue(false);
      userRepository.existsByUsername.mockResolvedValue(false);
      userRepository.create.mockResolvedValue(mockUser);
      bcrypt.hash.mockResolvedValue("hashed_password");
      generateTokens.mockReturnValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });

      await authService.register(minimalData);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: undefined,
          username: undefined,
          nativeLanguage: "fa",
          learningGoal: "general",
        })
      );
    });
  });

  describe("login", () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      password: "hashed_password",
      isActive: true,
      role: "user",
      toJSON: () => ({
        id: "user-123",
        email: "test@example.com",
        role: "user",
        isActive: true,
      }),
      update: jest.fn().mockResolvedValue(true),
    };

    it("should login successfully with correct credentials", async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      generateTokens.mockReturnValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });

      const result = await authService.login("test@example.com", "Password123");

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(mockUser.update).toHaveBeenCalledWith({
        refreshToken: "refresh-token",
        lastLoginAt: expect.any(Date),
      });
    });

    it("should throw ValidationError if email or password missing", async () => {
      await expect(authService.login("", "")).rejects.toThrow(ValidationError);
      await expect(authService.login("test@example.com", "")).rejects.toThrow(ValidationError);
      await expect(authService.login("", "Password123")).rejects.toThrow(ValidationError);
    });

    it("should throw UnauthorizedError if user not found", async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login("notfound@example.com", "Password123")).rejects.toThrow(
        UnauthorizedError
      );
    });

    it("should throw UnauthorizedError with correct message if account is deactivated", async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      userRepository.findByEmail.mockResolvedValue(inactiveUser);

      await expect(authService.login("test@example.com", "Password123")).rejects.toThrow(
        "Your account has been deactivated. Please contact support."
      );
    });

    it("should throw UnauthorizedError if password is incorrect", async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.login("test@example.com", "WrongPassword")).rejects.toThrow(
        UnauthorizedError
      );
    });
  });

  describe("refreshAccessToken", () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      refreshToken: "valid-refresh-token",
      isActive: true,
      role: "user",
      toJSON: () => ({
        id: "user-123",
        email: "test@example.com",
        role: "user",
        isActive: true,
      }),
    };

    it("should refresh token successfully", async () => {
      const decoded = { id: "user-123", email: "test@example.com" };
      const verifyRefreshToken = jest.fn().mockReturnValue(decoded);
      jest.doMock("../../../utils/jwt.js", () => ({
        verifyRefreshToken,
        generateTokens: () => ({ accessToken: "new-access-token" }),
      }));

      userRepository.findByIdOrFail.mockResolvedValue(mockUser);
      const { generateTokens } = await import("../../../utils/jwt.js");
      generateTokens.mockReturnValue({ accessToken: "new-access-token" });

      const result = await authService.refreshAccessToken("valid-refresh-token");

      expect(result).toHaveProperty("accessToken");
      expect(result.accessToken).toBe("new-access-token");
    });

    it("should throw UnauthorizedError if no refresh token provided", async () => {
      await expect(authService.refreshAccessToken(null)).rejects.toThrow(UnauthorizedError);
      await expect(authService.refreshAccessToken("")).rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError if refresh token is invalid", async () => {
      const verifyRefreshToken = jest.fn().mockReturnValue(null);
      jest.doMock("../../../utils/jwt.js", () => ({ verifyRefreshToken }));

      await expect(authService.refreshAccessToken("invalid-token")).rejects.toThrow(
        UnauthorizedError
      );
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      const mockUser = {
        id: "user-123",
        update: jest.fn().mockResolvedValue(true),
      };
      userRepository.findByIdOrFail.mockResolvedValue(mockUser);

      const result = await authService.logout("user-123");

      expect(result).toBe(true);
      expect(mockUser.update).toHaveBeenCalledWith({ refreshToken: null });
    });

    it("should throw NotFoundError if user not found", async () => {
      userRepository.findByIdOrFail.mockRejectedValue(new NotFoundError());

      await expect(authService.logout("non-existent")).rejects.toThrow(NotFoundError);
    });
  });

  describe("changePassword", () => {
    const mockUser = {
      id: "user-123",
      password: "hashed_old_password",
      update: jest.fn().mockResolvedValue(true),
    };

    it("should change password successfully", async () => {
      userRepository.findByIdOrFail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue("hashed_new_password");

      const result = await authService.changePassword(
        "user-123",
        "OldPassword123",
        "NewPassword456"
      );

      expect(result).toBe(true);
      expect(mockUser.update).toHaveBeenCalledWith({ password: "NewPassword456" });
    });

    it("should throw ValidationError if passwords missing", async () => {
      await expect(authService.changePassword("user-123", "", "")).rejects.toThrow(ValidationError);
      await expect(authService.changePassword("user-123", "OldPass", "")).rejects.toThrow(
        ValidationError
      );
    });

    it("should throw ValidationError if new password too short", async () => {
      await expect(authService.changePassword("user-123", "OldPass123", "123")).rejects.toThrow(
        ValidationError
      );
    });

    it("should throw UnauthorizedError if current password is incorrect", async () => {
      userRepository.findByIdOrFail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.changePassword("user-123", "WrongPassword", "NewPassword456")
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("resetPassword", () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      resetPasswordToken: "hashed_token",
      resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour from now
      update: jest.fn().mockResolvedValue(true),
    };

    it("should reset password successfully", async () => {
      const decoded = { id: "user-123", email: "test@example.com" };
      jest.spyOn(jwt, "verify").mockReturnValue(decoded);
      userRepository.findByIdOrFail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.resetPassword("valid-token", "NewPassword123");

      expect(result).toBe(true);
      expect(mockUser.update).toHaveBeenCalledWith({
        password: "NewPassword123",
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });
    });

    it("should throw ValidationError if token or password missing", async () => {
      await expect(authService.resetPassword("", "")).rejects.toThrow(ValidationError);
      await expect(authService.resetPassword("token", "")).rejects.toThrow(ValidationError);
    });

    it("should throw UnauthorizedError if token is invalid", async () => {
      jest.spyOn(jwt, "verify").mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await expect(authService.resetPassword("invalid-token", "NewPassword123")).rejects.toThrow(
        UnauthorizedError
      );
    });
  });
});
