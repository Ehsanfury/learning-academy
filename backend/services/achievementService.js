/**
 * achievementService.js
 * Path: backend/services/achievementService.js
 * Description: Achievement management service
 * Version: 2.4 - ADDED: getRecentAchievements method
 * Changes:
 * - ✅ ADDED: getRecentAchievements method
 * - ✅ FIXED: Achievement awarding
 */

import { Achievement, UserAchievement, User } from "../models/index.js";
import { NotFoundError } from "../errors/index.js";
import logger from "../config/logger.js";
import sequelize from "../config/db.js";

class AchievementService {
  // ============================================
  // 📊 Get Achievements
  // ============================================

  async getAllAchievementsWithStatus(userId) {
    try {
      const allAchievements = await Achievement.findAll({
        where: { isActive: true },
        order: [["displayOrder", "ASC"]],
      });

      const userAchievements = await UserAchievement.findAll({
        where: { userId },
        include: [
          {
            model: Achievement,
            as: "achievement",
          },
        ],
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
        userAchievementId: earnedMap[achievement.id]?.id || null,
      }));
    } catch (error) {
      logger.error("❌ Error in getAllAchievementsWithStatus:", error);
      throw error;
    }
  }

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

      return userAchievements.map((ua) => {
        const data = ua.toJSON();
        return {
          ...data.achievement,
          earnedAt: data.earnedAt,
          isViewed: data.isViewed,
          userAchievementId: data.id,
        };
      });
    } catch (error) {
      logger.error("❌ Error in getUserAchievements:", error);
      throw error;
    }
  }

  /**
   * ✅ NEW: Get recent achievements for user
   */
  async getRecentAchievements(userId, limit = 5) {
    try {
      const userAchievements = await UserAchievement.findAll({
        where: { userId },
        include: [
          {
            model: Achievement,
            as: "achievement",
            where: { isActive: true },
          },
        ],
        order: [["earnedAt", "DESC"]],
        limit: limit,
      });

      return userAchievements.map((ua) => {
        const data = ua.toJSON();
        return {
          id: ua.achievementId,
          name: data.achievement?.name || "Unknown",
          title: data.achievement?.title || { fa: "دستاورد", en: "Achievement" },
          icon: data.achievement?.icon || "🏆",
          color: data.achievement?.color || "#6366f1",
          earnedAt: data.earnedAt,
          isViewed: data.isViewed || false,
          userAchievementId: data.id,
        };
      });
    } catch (error) {
      logger.error("❌ Error in getRecentAchievements:", error);
      return [];
    }
  }

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

      return userAchievements.map((ua) => {
        const data = ua.toJSON();
        return {
          ...data.achievement,
          earnedAt: data.earnedAt,
          userAchievementId: data.id,
        };
      });
    } catch (error) {
      logger.error("❌ Error in getUnviewedAchievements:", error);
      throw error;
    }
  }

  async getAchievementById(achievementId) {
    try {
      const achievement = await Achievement.findByPk(achievementId);
      if (!achievement) {
        throw new NotFoundError(`Achievement with id ${achievementId} not found`);
      }
      return achievement;
    } catch (error) {
      logger.error("❌ Error in getAchievementById:", error);
      throw error;
    }
  }

  // ============================================
  // 📊 Achievement Stats
  // ============================================

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
      logger.error("❌ Error in getAchievementStats:", error);
      throw error;
    }
  }

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
      logger.error("❌ Error in getGlobalStats:", error);
      throw error;
    }
  }

  // ============================================
  // 🔄 Achievement Actions
  // ============================================

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

      logger.info(`✅ Achievement ${achievementId} marked as viewed for user ${userId}`);
      return { success: true, alreadyViewed: false };
    } catch (error) {
      logger.error("❌ Error in markAsViewed:", error);
      throw error;
    }
  }

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

      logger.info(`✅ All achievements marked as viewed for user ${userId}`);
      return { success: true, updatedCount: result[0] };
    } catch (error) {
      logger.error("❌ Error in markAllAsViewed:", error);
      throw error;
    }
  }

  // ============================================
  // 🏆 Award Achievements
  // ============================================

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
        isEarned: true,
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

      logger.info(`🏆 Achievement ${achievementName} awarded to user ${userId} (+${xpAmount} XP)`);

      return {
        success: true,
        achievement: achievement.toJSON(),
        userAchievement: userAchievement.toJSON(),
        xpEarned: xpAmount,
      };
    } catch (error) {
      logger.error("❌ Error in awardAchievement:", error);
      throw error;
    }
  }

  /**
   * ✅ FIXED: Check and award achievements based on user activity
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

      // Count completed lessons
      const { LessonProgress } = await import("../models/index.js");
      const { Op } = await import("sequelize");

      const completedLessons = await LessonProgress.count({
        where: {
          userId,
          status: {
            [Op.in]: ["completed", "perfect"],
          },
        },
      });

      const perfectLessons = await LessonProgress.count({
        where: {
          userId,
          status: "perfect",
        },
      });

      const userStats = {
        lessonsCompleted: completedLessons,
        perfectLessons: perfectLessons,
        streak: user.streak || 0,
        totalXP: user.xp || 0,
        wordsLearned: await this.countUserWords(userId),
        aiConversations: await this.countAIConversations(userId),
      };

      logger.info(`🔍 Checking achievements for user ${userId}`, {
        event,
        stats: userStats,
        earnedCount: earnedIds.size,
      });

      // Check each achievement condition
      for (const achievement of achievements) {
        // Skip if already earned
        if (earnedIds.has(achievement.id)) {
          logger.info(`⏭️ Achievement ${achievement.name} already earned`);
          continue;
        }

        const condition = achievement.condition;
        let shouldAward = false;

        // ✅ FIXED: Check condition properly
        if (condition && condition.type) {
          switch (condition.type) {
            case "lessons_completed":
              shouldAward = userStats.lessonsCompleted >= condition.target;
              logger.info(
                `📊 ${achievement.name}: lessons=${userStats.lessonsCompleted}, target=${condition.target}, result=${shouldAward}`
              );
              break;
            case "perfect_lessons":
              shouldAward = userStats.perfectLessons >= condition.target;
              logger.info(
                `📊 ${achievement.name}: perfect=${userStats.perfectLessons}, target=${condition.target}, result=${shouldAward}`
              );
              break;
            case "streak":
              shouldAward = userStats.streak >= condition.target;
              logger.info(
                `📊 ${achievement.name}: streak=${userStats.streak}, target=${condition.target}, result=${shouldAward}`
              );
              break;
            case "total_xp":
              shouldAward = userStats.totalXP >= condition.target;
              logger.info(
                `📊 ${achievement.name}: xp=${userStats.totalXP}, target=${condition.target}, result=${shouldAward}`
              );
              break;
            case "words_learned":
              shouldAward = userStats.wordsLearned >= condition.target;
              logger.info(
                `📊 ${achievement.name}: words=${userStats.wordsLearned}, target=${condition.target}, result=${shouldAward}`
              );
              break;
            case "ai_conversations":
              shouldAward = userStats.aiConversations >= condition.target;
              logger.info(
                `📊 ${achievement.name}: ai=${userStats.aiConversations}, target=${condition.target}, result=${shouldAward}`
              );
              break;
            case "event":
              shouldAward = event === condition.event;
              logger.info(
                `📊 ${achievement.name}: event=${event}, target=${condition.event}, result=${shouldAward}`
              );
              break;
            default:
              shouldAward = false;
          }
        }

        if (shouldAward) {
          try {
            const result = await this.awardAchievement(userId, achievement.name);
            if (result.success) {
              awarded.push(result);
              logger.info(`🏆 Achievement ${achievement.name} awarded to user ${userId}`);
            }
          } catch (awardError) {
            logger.error(`❌ Failed to award achievement ${achievement.name}:`, awardError);
          }
        }
      }

      return {
        success: true,
        awarded,
        count: awarded.length,
      };
    } catch (error) {
      logger.error("❌ Error in checkAndAwardAchievements:", error);
      throw error;
    }
  }

  // ============================================
  // 🛠️ Helper Methods
  // ============================================

  async countUserWords(userId) {
    const { WordProgress } = await import("../models/index.js");
    const count = await WordProgress.count({
      where: { userId },
    });
    return count;
  }

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

  async createAchievement(data) {
    try {
      const achievement = await Achievement.create(data);
      logger.info(`✅ New achievement created: ${achievement.name}`);
      return achievement;
    } catch (error) {
      logger.error("❌ Error in createAchievement:", error);
      throw error;
    }
  }

  async updateAchievement(achievementId, data) {
    try {
      const achievement = await Achievement.findByPk(achievementId);
      if (!achievement) {
        throw new NotFoundError(`Achievement ${achievementId} not found`);
      }

      await achievement.update(data);
      logger.info(`✅ Achievement updated: ${achievement.name}`);
      return achievement;
    } catch (error) {
      logger.error("❌ Error in updateAchievement:", error);
      throw error;
    }
  }

  async deleteAchievement(achievementId) {
    try {
      const achievement = await Achievement.findByPk(achievementId);
      if (!achievement) {
        throw new NotFoundError(`Achievement ${achievementId} not found`);
      }

      await UserAchievement.destroy({
        where: { achievementId },
      });

      await achievement.destroy();
      logger.info(`🗑️ Achievement deleted: ${achievement.name}`);
      return { success: true };
    } catch (error) {
      logger.error("❌ Error in deleteAchievement:", error);
      throw error;
    }
  }
}

const achievementService = new AchievementService();
export default achievementService;
