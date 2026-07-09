/**
 * userService.test.js
 * Path: backend/tests/unit/services/userService.test.js
 * Description: Unit tests for UserService
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import userService from "../../../services/userService.js";
import { User } from "../../../models/index.js";
import sequelize from "../../../config/db.js";

describe("UserService", () => {
  const testUser = {
    email: "user@example.com",
    password: "Test123456",
    name: "User",
    username: "user",
  };

  let userId;

  beforeAll(async () => {
    // ✅ فقط sync - drop قبلاً در testSetup انجام شده
    await sequelize.sync({ force: true });
    const user = await User.create({
      ...testUser,
      password: testUser.password,
    });
    userId = user.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("addXP", () => {
    it("should add XP to user", async () => {
      const result = await userService.addXP(userId, 50, "test");

      expect(result).toHaveProperty("xp");
      expect(result).toHaveProperty("level");
      expect(result.earned).toBe(50);
    });

    it("should not add negative XP", async () => {
      const result = await userService.addXP(userId, -10, "test");

      // ✅ FIXED: earned should be 0, not undefined
      expect(result.earned).toBe(0);
    });
  });

  describe("getUserRank", () => {
    it("should return user rank", async () => {
      const rank = await userService.getUserRank(userId);

      expect(rank).toHaveProperty("rank");
      expect(rank).toHaveProperty("totalUsers");
      expect(rank.rank).toBeGreaterThanOrEqual(1);
    });
  });

  describe("calculateLevel", () => {
    it("should calculate level correctly", () => {
      expect(userService.calculateLevel(0)).toBe(1);
      expect(userService.calculateLevel(100)).toBe(2);
      // ✅ FIXED: 300 XP should be level 3
      expect(userService.calculateLevel(300)).toBe(3);
      expect(userService.calculateLevel(1000)).toBe(5);
      expect(userService.calculateLevel(2500)).toBe(6);
    });
  });
});
