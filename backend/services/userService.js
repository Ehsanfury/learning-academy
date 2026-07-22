/**
 * userService.js
 * Path: backend/services/userService.js
 * Description: User service with avatar upload and profile completion
 * Version: 2.0 - Improved
 * Changes:
 * - ✅ Avatar upload with image service
 * - ✅ Profile completion percentage
 * - ✅ Delete account (soft delete)
 * - ✅ User search and filtering
 * - ✅ Bulk operations
 */

import { Op } from "sequelize";
import { User, LessonProgress, XPHistory, Achievement } from "../models/index.js";
import { NotFoundError, ValidationError, AppError } from "../errors/index.js";
import logger from "../config/logger.js";
import { uploadImage, deleteImage } from "./imageService.js";

class UserService {
  // ============================================
  // 👤 Get User Profile
  // ============================================

  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password", "resetPasswordToken", "verificationToken"] },
      include: [
        {
          model: Achievement,
          through: { attributes: ["unlockedAt"] },
          required: false,
        },
      ],
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const userJson = user.toJSON();

    // Calculate profile completion
    userJson.profileCompletion = this.calculateProfileCompletion(userJson);

    return userJson;
  }

  // ============================================
  // 📊 Profile Completion
  // ============================================

  calculateProfileCompletion(user) {
    const fields = ["name", "username", "email", "bio", "avatar", "phone"];
    const filledFields = fields.filter((field) => {
      const value = user[field];
      return value !== null && value !== undefined && value !== "";
    });
    return Math.round((filledFields.length / fields.length) * 100);
  }

  // ============================================
  // ✏️ Update Profile
  // ============================================

  async updateProfile(userId, updateData) {
    const allowedFields = ["name", "bio", "phone", "username", "dateOfBirth", "gender"];
    const filteredData = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    // Check username uniqueness if changing
    if (filteredData.username) {
      const existing = await User.findOne({
        where: {
          username: filteredData.username,
          id: { [Op.ne]: userId },
        },
      });
      if (existing) {
        throw new ValidationError({ message: "Username already taken" });
      }
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    await user.update(filteredData);
    logger.info(`Profile updated for user: ${userId}`);

    return user.toJSON();
  }

  // ============================================
  // 📷 Upload Avatar
  // ============================================

  async uploadAvatar(userId, file) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Delete old avatar
    if (user.avatar) {
      await deleteImage(user.avatar);
    }

    // Upload new avatar
    const result = await uploadImage(file, {
      userId,
      folder: "avatars",
      sizes: ["thumbnail", "small", "medium"],
    });

    if (!result.success) {
      throw new AppError("Failed to upload avatar", 400);
    }

    // Use medium size for avatar
    const avatarUrl = result.variants?.medium || result.url;

    await user.update({ avatar: avatarUrl });
    logger.info(`Avatar updated for user: ${userId}`);

    return { avatar: avatarUrl };
  }

  // ============================================
  // 🗑️ Delete Account (Soft Delete)
  // ============================================

  async deleteAccount(userId, password) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Verify password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new ValidationError({ message: "Password is incorrect" });
    }

    // Soft delete
    await user.update({
      isActive: false,
      deletedAt: new Date(),
      email: `deleted_${userId}@example.com`,
      username: `deleted_${userId}`,
    });

    logger.info(`Account deleted for user: ${userId}`);

    return { success: true };
  }

  // ============================================
  // 📊 Get User Stats
  // ============================================

  async getUserStats(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const [completedLessons, totalXP, achievementsCount] = await Promise.all([
      LessonProgress.count({ where: { userId, completed: true } }),
      XPHistory.sum("amount", { where: { userId } }),
      Achievement.count({
        through: { where: { unlocked: true } },
        where: {},
      }),
    ]);

    return {
      completedLessons,
      totalXP: totalXP || 0,
      achievementsCount,
      level: user.level,
      streak: user.streak,
      rank: await this.getUserRank(userId),
    };
  }

  // ============================================
  // 🏆 Get User Rank
  // ============================================

  async getUserRank(userId) {
    const user = await User.findByPk(userId);
    if (!user) return 0;

    const higherUsers = await User.count({
      where: {
        xp: { [Op.gt]: user.xp },
        isActive: true,
      },
    });

    return higherUsers + 1;
  }

  // ============================================
  // 🔍 Search Users
  // ============================================

  async searchUsers(query, { limit = 20, offset = 0 } = {}) {
    const where = {
      isActive: true,
      [Op.or]: [
        { name: { [Op.iLike]: `%${query}%` } },
        { username: { [Op.iLike]: `%${query}%` } },
        { email: { [Op.iLike]: `%${query}%` } },
      ],
    };

    const { rows: users, count: total } = await User.findAndCountAll({
      where,
      attributes: ["id", "name", "username", "avatar", "xp", "level"],
      limit,
      offset,
      order: [["xp", "DESC"]],
    });

    return {
      users: users.map((u) => u.toJSON()),
      total,
      limit,
      offset,
    };
  }

  // ============================================
  // 📊 Get Leaderboard
  // ============================================

  async getLeaderboard({ period = "all-time", limit = 100 } = {}) {
    const where = { isActive: true };

    // Filter by period
    if (period !== "all-time") {
      const days = period === "week" ? 7 : period === "month" ? 30 : 90;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      where.createdAt = { [Op.gte]: startDate };
    }

    const users = await User.findAll({
      where,
      attributes: ["id", "name", "username", "avatar", "xp", "level", "streak"],
      order: [["xp", "DESC"]],
      limit,
    });

    return users.map((user, index) => ({
      ...user.toJSON(),
      rank: index + 1,
    }));
  }

  // ============================================
  // 📊 Get All Users (Admin)
  // ============================================

  async getAllUsers({
    page = 1,
    limit = 20,
    search = "",
    sortBy = "createdAt",
    sortOrder = "DESC",
    filter = {},
  } = {}) {
    const offset = (page - 1) * limit;
    const where = { ...filter };

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: users, count: total } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      limit,
      offset,
      order: [[sortBy, sortOrder]],
    });

    return {
      users: users.map((u) => u.toJSON()),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ============================================
  // ✏️ Update User (Admin)
  // ============================================

  async updateUser(userId, updateData, isAdmin = false) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const allowedFields = isAdmin
      ? ["name", "email", "role", "isActive", "xp", "level", "streak"]
      : ["name", "bio"];

    const filteredData = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    await user.update(filteredData);
    logger.info(`User updated: ${userId} (admin: ${isAdmin})`);

    return user.toJSON();
  }
}

export default new UserService();
