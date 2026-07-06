/**
 * userService.js
 * Path: backend/services/userService.js
 * Description: User management service
 * Version: 5.1 - Fixed sequelize import
 * Changes:
 * - ✅ Fixed: sequelize import - using default import
 * - ✅ Fixed: getRecentActivity alias from 'lesson' to 'progressLesson'
 * - ✅ Fixed: todayXP properly calculated from database
 * - ✅ Fixed: Using xpService for unified XP logic
 */

import { Op } from "sequelize";
import sequelize from "../config/db.js"; // ✅ FIXED: import sequelize from db config
import {
  User,
  LessonProgress,
  XPHistory,
  Lesson,
  Achievement,
  UserAchievement,
} from "../models/index.js";
import { NotFoundError } from "../errors/index.js";
import logger from "../config/logger.js";
import xpService from "./xpService.js";
import userRepository from "../repositories/userRepository.js";

class UserService {
  // ============================================
  // 📊 User Profile
  // ============================================

  /**
   * Get user profile with stats
   */
  async getUserProfile(userId) {
    try {
      const user = await userRepository.findByIdOrFail(userId);
      const todayXP = await this.getTodayXP(userId);
      const stats = await this.getUserStats(userId);

      return {
        ...user.toJSON(),
        todayXP,
        stats,
      };
    } catch (error) {
      logger.error(`❌ Error in getUserProfile:`, error);
      throw error;
    }
  }

  /**
   * Get today's XP
   */
  async getTodayXP(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await LessonProgress.sum("xpEarned", {
        where: {
          userId,
          completedAt: {
            [Op.gte]: today,
          },
          status: {
            [Op.in]: ["completed", "perfect"],
          },
        },
      });

      return parseInt(result || 0);
    } catch (error) {
      logger.error(`❌ Error in getTodayXP:`, error);
      return 0;
    }
  }

  /**
   * Get user stats
   */
  async getUserStats(userId) {
    try {
      const user = await userRepository.findByIdOrFail(userId);

      const lessonStats = await LessonProgress.findAll({
        where: { userId },
        attributes: ["status", [sequelize.fn("COUNT", sequelize.col("status")), "count"]],
        group: ["status"],
      });

      const stats = {
        totalLessons: 0,
        completedLessons: 0,
        perfectLessons: 0,
        inProgress: 0,
      };

      lessonStats.forEach((item) => {
        const count = parseInt(item.get("count"));
        switch (item.status) {
          case "completed":
            stats.completedLessons = count;
            break;
          case "perfect":
            stats.perfectLessons = count;
            break;
          case "in_progress":
            stats.inProgress = count;
            break;
        }
      });

      stats.totalLessons = stats.completedLessons + stats.perfectLessons + stats.inProgress;
      const todayXP = await this.getTodayXP(userId);

      return {
        ...stats,
        xp: user.xp,
        level: xpService.calculateLevel(user.xp),
        streak: user.streak,
        todayXP,
        dailyGoal: 50,
        nextLevelXP: xpService.getXPForNextLevel(user.xp),
        progressToNextLevel: xpService.getProgressToNextLevel(user.xp),
      };
    } catch (error) {
      logger.error(`❌ Error in getUserStats:`, error);
      return {
        totalLessons: 0,
        completedLessons: 0,
        perfectLessons: 0,
        inProgress: 0,
        xp: 0,
        level: 1,
        streak: 0,
        todayXP: 0,
        dailyGoal: 50,
        nextLevelXP: 100,
        progressToNextLevel: 0,
      };
    }
  }

  // ============================================
  // ⭐ XP Management
  // ============================================

  async addXP(userId, amount, source) {
    try {
      const user = await userRepository.findByIdOrFail(userId);
      const result = xpService.addXP(user.xp, amount);

      await user.update({
        xp: result.xp,
        level: result.level,
      });

      await this.logXPGain(userId, amount, result.xp, source);

      return result;
    } catch (error) {
      logger.error(`❌ Error in addXP:`, error);
      throw error;
    }
  }

  async logXPGain(userId, amount, totalXP, source) {
    try {
      await XPHistory.create({
        userId,
        amount,
        totalXP,
        source,
        createdAt: new Date(),
      });
    } catch (error) {
      logger.error(`❌ Error in logXPGain:`, error);
    }
  }

  async updateStreak(userId) {
    return userRepository.updateStreak(userId);
  }

  // ============================================
  // 🏆 Leaderboard
  // ============================================

  async getLeaderboard(type = "xp", limit = 10, offset = 0) {
    try {
      let result;

      switch (type) {
        case "xp":
          result = await userRepository.getTopByXP(limit, offset);
          break;
        case "level":
          result = await userRepository.getTopByLevel(limit, offset);
          break;
        case "streak":
          result = await userRepository.getTopByStreak(limit, offset);
          break;
        default:
          result = await userRepository.getTopByXP(limit, offset);
      }

      return {
        users: (result.users || []).map((user, index) => ({
          ...user.toJSON(),
          rank: offset + index + 1,
        })),
        total: result.total || 0,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil((result.total || 0) / limit),
        limit,
        offset,
      };
    } catch (error) {
      logger.error(`❌ Error in getLeaderboard:`, error);
      return {
        users: [],
        total: 0,
        page: 1,
        totalPages: 0,
        limit,
        offset,
      };
    }
  }

  async getUserRank(userId, type = "xp") {
    try {
      await userRepository.findByIdOrFail(userId);

      let order;
      switch (type) {
        case "xp":
          order = [["xp", "DESC"]];
          break;
        case "level":
          order = [
            ["level", "DESC"],
            ["xp", "DESC"],
          ];
          break;
        case "streak":
          order = [["streak", "DESC"]];
          break;
        default:
          order = [["xp", "DESC"]];
      }

      const users = await User.findAll({
        order,
        attributes: ["id"],
        where: { isActive: true },
      });

      const rank = users.findIndex((u) => u.id === userId) + 1;
      return rank > 0 ? rank : null;
    } catch (error) {
      logger.error(`❌ Error in getUserRank:`, error);
      return null;
    }
  }

  // ============================================
  // 👤 Profile Management
  // ============================================

  async updateProfile(userId, data) {
    try {
      const user = await userRepository.findByIdOrFail(userId);

      const allowedFields = [
        "name",
        "username",
        "bio",
        "avatar",
        "theme",
        "nativeLanguage",
        "learningGoal",
        "language",
        "dailyGoal",
        "notifications",
        "soundEnabled",
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
   * Get user's recent activity
   * ✅ FIXED: alias from 'lesson' to 'progressLesson'
   */
  async getRecentActivity(userId, limit = 10) {
    try {
      const activities = await LessonProgress.findAll({
        where: { userId },
        order: [["completedAt", "DESC"]],
        limit,
        attributes: ["id", "lessonId", "status", "score", "xpEarned", "completedAt"],
        include: [
          {
            model: Lesson,
            as: "progressLesson",
            attributes: ["title", "level", "lessonNumber"],
          },
        ],
      });

      return activities.map((activity) => ({
        id: activity.id,
        type: "lesson_completed",
        lesson: activity.progressLesson,
        status: activity.status,
        score: activity.score,
        xpEarned: activity.xpEarned,
        timestamp: activity.completedAt,
      }));
    } catch (error) {
      logger.error(`❌ Error in getRecentActivity:`, error);
      return [];
    }
  }

  async searchUsers(query, limit = 10) {
    return userRepository.search(query, limit);
  }

  async updateUserLevel(userId) {
    try {
      const user = await userRepository.findByIdOrFail(userId);

      const newLevel = xpService.calculateLevel(user.xp);
      const levelUp = newLevel > user.level;

      if (levelUp) {
        await user.update({ level: newLevel });
        logger.info(`User leveled up: ${userId} -> ${newLevel}`);
      }

      return {
        oldLevel: user.level,
        newLevel,
        levelUp,
        xp: user.xp,
      };
    } catch (error) {
      logger.error(`❌ Error in updateUserLevel:`, error);
      throw error;
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    const authService = await import("./authService.js");
    return authService.default.changePassword(userId, currentPassword, newPassword);
  }

  // ============================================
  // 🏆 Achievement Methods
  // ============================================

  async getUserAchievements(userId) {
    try {
      const achievements = await UserAchievement.findAll({
        where: { userId, isEarned: true },
        include: [
          {
            model: Achievement,
            as: "userAchievement",
          },
        ],
        order: [["earnedAt", "DESC"]],
      });

      return achievements.map((ua) => ({
        ...ua.userAchievement?.toJSON?.(),
        earnedAt: ua.earnedAt,
        progress: ua.progress,
      }));
    } catch (error) {
      logger.error(`❌ Error in getUserAchievements:`, error);
      return [];
    }
  }

  // ============================================
  // 👑 Admin Methods
  // ============================================

  async getAdminStats() {
    try {
      const [totalUsers, activeUsers, totalXP, totalLessons, completedLessons, totalAchievements] =
        await Promise.all([
          User.count(),
          User.count({ where: { isActive: true } }),
          User.sum("xp"),
          Lesson.count({ where: { isActive: true } }),
          LessonProgress.count({ where: { status: ["completed", "perfect"] } }),
          Achievement.count(),
        ]);

      const lastDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const dailyActive = await User.count({
        where: {
          lastLoginAt: { [Op.gte]: lastDay },
        },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newUsersToday = await User.count({
        where: {
          createdAt: { [Op.gte]: today },
        },
      });

      const lessonsToday = await LessonProgress.count({
        where: {
          completedAt: { [Op.gte]: today },
          status: ["completed", "perfect"],
        },
      });

      const earnedAchievements = await UserAchievement.count({
        where: { isEarned: true },
      });

      return {
        users: {
          total: totalUsers || 0,
          active: activeUsers || 0,
          dailyActive: dailyActive || 0,
          newToday: newUsersToday || 0,
        },
        lessons: {
          total: totalLessons || 0,
          completed: completedLessons || 0,
          completedToday: lessonsToday || 0,
          completionRate:
            totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        },
        achievements: {
          total: totalAchievements || 0,
          earned: earnedAchievements || 0,
        },
        xp: {
          total: totalXP || 0,
          average: totalUsers > 0 ? Math.round((totalXP || 0) / totalUsers) : 0,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(`❌ Error in getAdminStats:`, error);
      return {
        users: { total: 0, active: 0, dailyActive: 0, newToday: 0 },
        lessons: { total: 0, completed: 0, completedToday: 0, completionRate: 0 },
        achievements: { total: 0, earned: 0 },
        xp: { total: 0, average: 0 },
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getUsers({ limit = 50, offset = 0, search = "" }) {
    try {
      const where = {};
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { username: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        limit,
        offset,
        attributes: {
          exclude: ["password", "refreshToken", "resetPasswordToken"],
        },
        order: [["createdAt", "DESC"]],
      });

      return {
        users: rows,
        total: count,
        limit,
        offset,
      };
    } catch (error) {
      logger.error(`❌ Error in getUsers:`, error);
      return { users: [], total: 0, limit, offset };
    }
  }

  async updateUserRole(userId, role) {
    const user = await userRepository.findByIdOrFail(userId);
    await user.update({ role });
    return user.toJSON();
  }

  async deleteUser(userId) {
    try {
      const user = await userRepository.findByIdOrFail(userId);
      await user.destroy();
      return { success: true };
    } catch (error) {
      logger.error(`❌ Error in deleteUser:`, error);
      throw error;
    }
  }
}

export default new UserService();
