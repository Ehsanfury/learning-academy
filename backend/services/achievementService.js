/**
 * achievementService.js
 * Path: backend/services/achievementService.js
 * Description: Achievement management service
 * Version: 2.0 - Complete implementation
 */

import { Achievement, UserAchievement, User } from "../models/index.js";
import { NotFoundError, ValidationError } from "../errors/index.js";
import logger from "../config/logger.js";
import xpService from "./xpService.js";
// ✅ FIXED: Added sequelize import
import sequelize from "../config/db.js";

class AchievementService {
  // ============================================
  // 📊 Get Achievements
  // ============================================

  /**
   * Get all achievements with status for user
   */
  async getAllAchievementsWithStatus(userId) {
    try {
      const allAchievements = await Achievement.findAll({
        where: { isActive: true },
        order: [["displayOrder", "ASC"]],
      });

      const userAchievements = await UserAchievement.findAll({
        where: { userId },
      });

      const earnedIds = new Set(userAchievements.map((ua) => ua.achievementId));
      const earnedMap = {};
      userAchievements.forEach((ua) => {
        earnedMap[ua.achievementId] = ua;
      });

      return allAchievements.map((achievement) => ({
        ...achievement.toJSON(),
        earned: earnedIds.has(achievement.id),
        earnedAt: earnedMap[achievement.id]?.earnedAt || null,
        isViewed: earnedMap[achievement.id]?.isViewed || false,
        progress: earnedIds.has(achievement.id) ? 100 : 0,
      }));
    } catch (error) {
      logger.error("Error in getAllAchievementsWithStatus:", error);
      throw error;
    }
  }

  /**
   * Get user earned achievements
   */
  async getUserAchievements(userId) {
    try {
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

      return userAchievements.map((ua) => ({
        ...ua.achievement.toJSON(),
        earnedAt: ua.earnedAt,
        isViewed: ua.isViewed,
        userAchievementId: ua.id,
      }));
    } catch (error) {
      logger.error("Error in getUserAchievements:", error);
      throw error;
    }
  }

  /**
   * Get unviewed achievements
   */
  async getUnviewedAchievements(userId) {
    try {
      const userAchievements = await UserAchievement.findAll({
        where: {
          userId,
          isViewed: false,
        },
        include: [
          {
            model: Achievement,
            as: "achievement",
          },
        ],
        order: [["earnedAt", "DESC"]],
      });

      return userAchievements.map((ua) => ({
        ...ua.achievement.toJSON(),
        earnedAt: ua.earnedAt,
        userAchievementId: ua.id,
      }));
    } catch (error) {
      logger.error("Error in getUnviewedAchievements:", error);
      throw error;
    }
  }

  /**
   * Get a specific achievement by ID
   */
  async getAchievementById(achievementId) {
    try {
      const achievement = await Achievement.findByPk(achievementId);
      if (!achievement) {
        throw new NotFoundError(`Achievement with id ${achievementId} not found`);
      }
      return achievement;
    } catch (error) {
      logger.error("Error in getAchievementById:", error);
      throw error;
    }
  }

  // ============================================
  // 📊 Achievement Stats
  // ============================================

  /**
   * Get achievement statistics for a user
   */
  async getAchievementStats(userId) {
    try {
      const total = await Achievement.count({ where: { isActive: true } });
      const earned = await UserAchievement.count({ where: { userId } });
      const unviewed = await UserAchievement.count({
        where: { userId, isViewed: false },
      });

      return {
        total,
        earned,
        unviewed,
        progress: total > 0 ? Math.round((earned / total) * 100) : 0,
        remaining: total - earned,
      };
    } catch (error) {
      logger.error("Error in getAchievementStats:", error);
      throw error;
    }
  }

  /**
   * Get global achievement statistics
   * ✅ FIXED: Added sequelize import
   */
  async getGlobalStats() {
    try {
      const total = await Achievement.count({ where: { isActive: true } });
      const totalEarned = await UserAchievement.count();
      const uniqueUsers = await UserAchievement.findAll({
        attributes: [[sequelize.fn("DISTINCT", sequelize.col("userId")), "userId"]],
        raw: true,
      });

      const mostEarned = await Achievement.findAll({
        attributes: [
          "id",
          "name",
          "title",
          "icon",
          "color",
          [sequelize.fn("COUNT", sequelize.col("userAchievements.id")), "earnedCount"],
        ],
        include: [
          {
            model: UserAchievement,
            as: "userAchievements",
            attributes: [],
          },
        ],
        group: ["Achievement.id"],
        order: [[sequelize.fn("COUNT", sequelize.col("userAchievements.id")), "DESC"]],
        limit: 5,
      });

      return {
        totalAchievements: total,
        totalEarned: totalEarned,
        uniqueUsers: uniqueUsers.length,
        mostEarned: mostEarned.map((a) => ({
          id: a.id,
          name: a.name,
          title: a.title,
          icon: a.icon,
          color: a.color,
          earnedCount: parseInt(a.get("earnedCount")),
        })),
      };
    } catch (error) {
      logger.error("Error in getGlobalStats:", error);
      throw error;
    }
  }

  // ============================================
  // 🔄 Achievement Actions
  // ============================================

  /**
   * Mark achievement as viewed
   */
  async markAsViewed(userId, achievementId) {
    try {
      const userAchievement = await UserAchievement.findOne({
        where: { userId, achievementId },
      });

      if (!userAchievement) {
        throw new NotFoundError(`Achievement ${achievementId} not found for user ${userId}`);
      }

      if (userAchievement.isViewed) {
        return { success: true, alreadyViewed: true };
      }

      await userAchievement.update({ isViewed: true });

      logger.info(`Achievement ${achievementId} marked as viewed for user ${userId}`);
      return { success: true, alreadyViewed: false };
    } catch (error) {
      logger.error("Error in markAsViewed:", error);
      throw error;
    }
  }

  /**
   * Mark all achievements as viewed
   */
  async markAllAsViewed(userId) {
    try {
      const result = await UserAchievement.update(
        { isViewed: true },
        {
          where: {
            userId,
            isViewed: false,
          },
        }
      );

      logger.info(`All achievements marked as viewed for user ${userId}`);
      return { success: true, updatedCount: result[0] };
    } catch (error) {
      logger.error("Error in markAllAsViewed:", error);
      throw error;
    }
  }

  // ============================================
  // 🏆 Award Achievements
  // ============================================

  /**
   * Award an achievement to a user
   */
  async awardAchievement(userId, achievementName, source = "manual") {
    try {
      const achievement = await Achievement.findOne({
        where: { name: achievementName, isActive: true },
      });

      if (!achievement) {
        throw new NotFoundError(`Achievement ${achievementName} not found`);
      }

      // Check if already earned
      const existing = await UserAchievement.findOne({
        where: { userId, achievementId: achievement.id },
      });

      if (existing) {
        return { success: false, alreadyEarned: true };
      }

      // Create user achievement
      const userAchievement = await UserAchievement.create({
        userId,
        achievementId: achievement.id,
        earnedAt: new Date(),
        isViewed: false,
      });

      // Update total earned count
      await achievement.increment("totalEarned", { by: 1 });

      // Award XP
      const xpAmount = achievement.xpReward || 50;
      const user = await User.findByPk(userId);
      if (user) {
        await user.increment("xp", { by: xpAmount });
        // Update level
        const newXP = user.xp + xpAmount;
        const xpPerLevel = 100;
        const newLevel = Math.floor(newXP / xpPerLevel) + 1;
        if (newLevel > user.level) {
          await user.update({ level: newLevel });
        }
      }

      logger.info(`Achievement ${achievementName} awarded to user ${userId} (${xpAmount} XP)`);

      return {
        success: true,
        achievement: achievement.toJSON(),
        userAchievement: userAchievement.toJSON(),
        xpEarned: xpAmount,
      };
    } catch (error) {
      logger.error("Error in awardAchievement:", error);
      throw error;
    }
  }

  /**
   * Check and award achievements based on user activity
   */
  async checkAndAwardAchievements(userId, event, data = {}) {
    try {
      const awarded = [];
      const user = await User.findByPk(userId);
      if (!user) {
        throw new NotFoundError(`User ${userId} not found`);
      }

      // Get all active achievements
      const achievements = await Achievement.findAll({
        where: { isActive: true },
      });

      // Get user's current progress
      const earnedIds = new Set(
        (await UserAchievement.findAll({ where: { userId } })).map((ua) => ua.achievementId)
      );

      const userStats = {
        lessonsCompleted: await this.countUserLessons(userId, "completed"),
        perfectLessons: await this.countUserLessons(userId, "perfect"),
        streak: user.streak || 0,
        totalXP: user.xp || 0,
        wordsLearned: await this.countUserWords(userId),
        aiConversations: await this.countAIConversations(userId),
      };

      // Check each achievement condition
      for (const achievement of achievements) {
        // Skip if already earned
        if (earnedIds.has(achievement.id)) continue;

        const condition = achievement.condition;
        const shouldAward = this.checkCondition(condition, userStats, event, data);

        if (shouldAward) {
          const result = await this.awardAchievement(userId, achievement.name);
          awarded.push(result);
        }
      }

      return {
        success: true,
        awarded,
        count: awarded.length,
      };
    } catch (error) {
      logger.error("Error in checkAndAwardAchievements:", error);
      throw error;
    }
  }

  // ============================================
  // 🛠️ Helper Methods
  // ============================================

  /**
   * Check if achievement condition is met
   */
  checkCondition(condition, userStats, event, data) {
    if (!condition || !condition.type) return false;

    switch (condition.type) {
      case "lessons_completed":
        return userStats.lessonsCompleted >= condition.target;
      case "perfect_lessons":
        return userStats.perfectLessons >= condition.target;
      case "streak":
        return userStats.streak >= condition.target;
      case "total_xp":
        return userStats.totalXP >= condition.target;
      case "words_learned":
        return userStats.wordsLearned >= condition.target;
      case "ai_conversations":
        return userStats.aiConversations >= condition.target;
      case "event":
        return event === condition.event;
      default:
        return false;
    }
  }

  /**
   * Count user's completed/perfect lessons
   */
  async countUserLessons(userId, status) {
    const { LessonProgress } = await import("../models/index.js");
    const count = await LessonProgress.count({
      where: {
        userId,
        status: status,
      },
    });
    return count;
  }

  /**
   * Count user's learned words
   */
  async countUserWords(userId) {
    const { WordProgress } = await import("../models/index.js");
    const count = await WordProgress.count({
      where: { userId },
    });
    return count;
  }

  /**
   * Count AI conversations
   */
  async countAIConversations(userId) {
    const { AIConversation } = await import("../models/index.js");
    const count = await AIConversation.count({
      where: {
        userId,
        sender: "user",
      },
    });
    return count;
  }

  // ============================================
  // 📋 Admin Methods
  // ============================================

  /**
   * Create a new achievement (admin)
   */
  async createAchievement(data) {
    try {
      const achievement = await Achievement.create(data);
      logger.info(`New achievement created: ${achievement.name}`);
      return achievement;
    } catch (error) {
      logger.error("Error in createAchievement:", error);
      throw error;
    }
  }

  /**
   * Update an achievement (admin)
   */
  async updateAchievement(achievementId, data) {
    try {
      const achievement = await Achievement.findByPk(achievementId);
      if (!achievement) {
        throw new NotFoundError(`Achievement ${achievementId} not found`);
      }

      await achievement.update(data);
      logger.info(`Achievement updated: ${achievement.name}`);
      return achievement;
    } catch (error) {
      logger.error("Error in updateAchievement:", error);
      throw error;
    }
  }

  /**
   * Delete an achievement (admin)
   */
  async deleteAchievement(achievementId) {
    try {
      const achievement = await Achievement.findByPk(achievementId);
      if (!achievement) {
        throw new NotFoundError(`Achievement ${achievementId} not found`);
      }

      // Delete all user achievements for this achievement
      await UserAchievement.destroy({
        where: { achievementId },
      });

      await achievement.destroy();
      logger.info(`Achievement deleted: ${achievement.name}`);
      return { success: true };
    } catch (error) {
      logger.error("Error in deleteAchievement:", error);
      throw error;
    }
  }
}

// ============================================
// 📤 Export
// ============================================

const achievementService = new AchievementService();
export default achievementService;
