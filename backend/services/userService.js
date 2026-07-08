/**
 * userService.js
 * Path: backend/services/userService.js
 * Description: User management service
 * Changes:
 * - ✅ FIXED: XP race condition - using xpService.addXP()
 * - ✅ FIXED: User rank - using subquery COUNT
 * - ✅ FIXED: Removed duplicate XP logic (use xpService)
 * - ✅ FIXED: Removed duplicate streak logic (use streakService)
 * - ✅ NEW: Added getRecentActivity method
 */

import { Op } from "sequelize";
import {
  User,
  UserAchievement,
  Achievement,
  XPHistory,
  LessonProgress,
  Lesson,
} from "../models/index.js";
import xpService from "./xpService.js";
import streakService from "./streakService.js";
import logger from "../config/logger.js";

class UserService {
  /**
   * Add XP to user - DELEGATED to xpService
   */
  async addXP(userId, amount, source = "unknown", sourceId = null, metadata = {}) {
    return xpService.addXP(userId, amount, source, sourceId, metadata);
  }

  /**
   * Calculate level based on XP - DELEGATED to xpService
   */
  calculateLevel(xp) {
    return xpService.calculateLevel(xp);
  }

  /**
   * Get user rank
   * ✅ FIXED: Uses subquery COUNT instead of loading all users
   */
  async getUserRank(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const user = await User.findByPk(userId, {
        attributes: ["id", "xp"],
      });

      if (!user) {
        throw new Error("User not found");
      }

      const rank = await User.count({
        where: {
          isActive: true,
          xp: { [Op.gt]: user.xp },
        },
      });

      const totalUsers = await User.count({
        where: { isActive: true },
      });

      return {
        rank: rank + 1,
        totalUsers,
        percentile: totalUsers > 0 ? Math.round((rank / totalUsers) * 100) : 0,
      };
    } catch (error) {
      logger.error(`❌ Error in getUserRank:`, error);
      return {
        rank: 0,
        totalUsers: 0,
        percentile: 0,
      };
    }
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const userAchievements = await UserAchievement.findAll({
        where: { userId },
        include: [
          {
            model: Achievement,
            as: "achievement",
          },
        ],
        order: [["earnedAt", "DESC"]],
      });

      const achievements = userAchievements.map((ua) => {
        const data = ua.toJSON();
        return {
          id: data.achievementId,
          name: data.achievement?.name || "Unknown Achievement",
          title: data.achievement?.title || "Unknown",
          icon: data.achievement?.icon || "🏆",
          color: data.achievement?.color || "#6366f1",
          earnedAt: data.earnedAt,
          isViewed: data.isViewed || false,
        };
      });

      return achievements;
    } catch (error) {
      logger.error(`❌ Error in getUserAchievements:`, error);
      return [];
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const user = await User.findByPk(userId, {
        attributes: {
          exclude: ["password", "resetPasswordToken"],
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const rank = await this.getUserRank(userId);
      const achievements = await this.getUserAchievements(userId);
      const level = xpService.calculateLevel(user.xp || 0);

      return {
        ...user.toJSON(),
        level,
        rank,
        achievements,
      };
    } catch (error) {
      logger.error(`❌ Error in getUserProfile:`, error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, data) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const allowedFields = [
        "name",
        "username",
        "email",
        "avatar",
        "bio",
        "language",
        "theme",
        "nativeLanguage",
        "learningGoal",
        "dailyGoal",
        "soundEnabled",
        "notifications",
        "streakReminder",
        "autoPlayAudio",
      ];

      const updateData = {};
      allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
          updateData[field] = data[field];
        }
      });

      await user.update(updateData);

      return user;
    } catch (error) {
      logger.error(`❌ Error in updateProfile:`, error);
      throw error;
    }
  }

  /**
   * Get user stats
   */
  async getUserStats(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }

      return {
        xp: user.xp || 0,
        level: xpService.calculateLevel(user.xp || 0),
        streak: user.streak || 0,
        longestStreak: user.longestStreak || 0,
        dailyGoal: user.dailyGoal || 50,
      };
    } catch (error) {
      logger.error(`❌ Error in getUserStats:`, error);
      return {
        xp: 0,
        level: 0,
        streak: 0,
        longestStreak: 0,
        dailyGoal: 50,
      };
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    try {
      if (!email) {
        throw new Error("Email is required");
      }

      const user = await User.findOne({
        where: { email: email.toLowerCase() },
      });

      return user;
    } catch (error) {
      logger.error(`❌ Error in getUserByEmail:`, error);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const user = await User.findByPk(userId, {
        attributes: {
          exclude: ["password", "resetPasswordToken"],
        },
      });

      return user;
    } catch (error) {
      logger.error(`❌ Error in getUserById:`, error);
      return null;
    }
  }

  /**
   * Get admin stats
   */
  async getAdminStats() {
    try {
      const totalUsers = await User.count({ where: { isActive: true } });
      const totalLessons = await Lesson.count({ where: { isActive: true } });
      const totalXP = (await XPHistory.sum("amount")) || 0;

      return {
        totalUsers,
        totalLessons,
        totalXP,
      };
    } catch (error) {
      logger.error(`❌ Error in getAdminStats:`, error);
      return {
        totalUsers: 0,
        totalLessons: 0,
        totalXP: 0,
      };
    }
  }

  /**
   * Get user recent activity
   */
  async getRecentActivity(userId, limit = 10) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const activities = await LessonProgress.findAll({
        where: {
          userId,
          status: {
            [Op.in]: ["completed", "perfect"],
          },
        },
        order: [["completedAt", "DESC"]],
        limit: parseInt(limit),
        attributes: ["id", "lessonId", "status", "score", "xpEarned", "completedAt"],
      });

      return activities.map((a) => ({
        id: a.id,
        lessonId: a.lessonId,
        status: a.status,
        score: a.score,
        xpEarned: a.xpEarned,
        completedAt: a.completedAt,
        type: "lesson_completed",
      }));
    } catch (error) {
      logger.error(`❌ Error in getRecentActivity:`, error);
      return [];
    }
  }

  /**
   * Update streak - DELEGATED to streakService
   */
  async updateStreak(userId, activityDate = new Date()) {
    return streakService.updateStreak(userId, activityDate);
  }

  /**
   * Log daily activity - DELEGATED to streakService
   */
  async logDailyActivity(userId, activityType = "login") {
    return streakService.logDailyActivity(userId, activityType);
  }

  /**
   * Get streak stats - DELEGATED to streakService
   */
  async getStreakStats(userId) {
    return streakService.getStreakStats(userId);
  }
}

export default new UserService();
