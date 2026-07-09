/**
 * authService.test.js
 * Path: backend/tests/unit/services/authService.test.js
 * Description: Unit tests for AuthService
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import authService from "../../../services/authService.js";
import { User } from "../../../models/index.js";
import sequelize from "../../../config/db.js";

describe("AuthService", () => {
  const testUser = {
    email: "test@example.com",
    password: "Test123456",
    name: "Test User",
    username: "testuser",
  };

  beforeAll(async () => {
    await sequelize.drop({ cascade: true });
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const result = await authService.register(testUser);

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.user.email).toBe(testUser.email);
      expect(result.user.name).toBe(testUser.name);
    });

    it("should not register user with existing email", async () => {
      await expect(authService.register(testUser)).rejects.toThrow();
    });
  });

  describe("login", () => {
    it("should login user with correct credentials", async () => {
      const result = await authService.login(testUser.email, testUser.password);

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.user.email).toBe(testUser.email);
    });

    it("should not login with wrong password", async () => {
      await expect(authService.login(testUser.email, "WrongPassword123")).rejects.toThrow();
    });

    it("should not login with non-existent email", async () => {
      await expect(authService.login("nonexistent@example.com", "password123")).rejects.toThrow();
    });
  });
});
