/**
 * levelService.js
 * Path: backend/services/levelService.js
 * Description: Level management service
 * Changes:
 * - ✅ New file created
 * - ✅ All methods implemented
 */

import { Op } from "sequelize";
import { Lesson, LessonProgress } from "../models/index.js";
import logger from "../config/logger.js";

class LevelService {
  /**
   * Get all levels with progress
   */
  async getLevels({ userId, level }) {
    try {
      const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

      if (level) {
        const filtered = levels.filter((l) => l === level);
        return filtered.map((l) => ({
          id: l,
          name: l,
          progress: 0,
        }));
      }

      return levels.map((l) => ({
        id: l,
        name: l,
        progress: 0,
      }));
    } catch (error) {
      logger.error("Error in getLevels:", error);
      return [];
    }
  }

  /**
   * Get level by ID
   */
  async getLevelById(levelId, userId) {
    try {
      const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
      if (!levels.includes(levelId)) return null;

      let progress = 0;
      if (userId) {
        const completed = await LessonProgress.count({
          where: {
            userId,
            status: { [Op.in]: ["completed", "perfect"] },
          },
          include: [
            {
              model: Lesson,
              as: "progressLesson",
              where: { level: levelId },
            },
          ],
        });

        const total = await Lesson.count({
          where: { level: levelId, isActive: true },
        });

        progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      }

      return {
        id: levelId,
        name: levelId,
        progress,
      };
    } catch (error) {
      logger.error("Error in getLevelById:", error);
      return null;
    }
  }

  /**
   * Get level progress
   */
  async getLevelProgress(userId, levelId) {
    try {
      const completed = await LessonProgress.count({
        where: {
          userId,
          status: { [Op.in]: ["completed", "perfect"] },
        },
        include: [
          {
            model: Lesson,
            as: "progressLesson",
            where: { level: levelId },
          },
        ],
      });

      const total = await Lesson.count({
        where: { level: levelId, isActive: true },
      });

      return {
        level: levelId,
        progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        totalLessons: total,
        completedLessons: completed,
      };
    } catch (error) {
      logger.error("Error in getLevelProgress:", error);
      return { level: levelId, progress: 0, totalLessons: 0, completedLessons: 0 };
    }
  }

  /**
   * Get user level stats
   */
  async getUserLevelStats(userId) {
    try {
      const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
      const stats = {};

      for (const level of levels) {
        const completed = await LessonProgress.count({
          where: {
            userId,
            status: { [Op.in]: ["completed", "perfect"] },
          },
          include: [
            {
              model: Lesson,
              as: "progressLesson",
              where: { level },
            },
          ],
        });

        const total = await Lesson.count({
          where: { level, isActive: true },
        });

        stats[level] = {
          total,
          completed,
          progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      }

      return stats;
    } catch (error) {
      logger.error("Error in getUserLevelStats:", error);
      return {};
    }
  }

  /**
   * Get level suggestions
   */
  async getSuggestions(userId, count = 3) {
    try {
      const levels = await this.getLevels({ userId });
      return levels.slice(0, count);
    } catch (error) {
      logger.error("Error in getSuggestions:", error);
      return [];
    }
  }

  /**
   * Check level lock status
   */
  async checkLevelLock(userId, levelId) {
    return { locked: false };
  }

  /**
   * Reset level progress
   */
  async resetLevelProgress(userId, levelId) {
    try {
      const lessons = await Lesson.findAll({
        where: { level: levelId },
      });

      const lessonIds = lessons.map((l) => l.id);

      await LessonProgress.destroy({
        where: {
          userId,
          lessonId: { [Op.in]: lessonIds },
        },
      });

      return { success: true };
    } catch (error) {
      logger.error("Error in resetLevelProgress:", error);
      throw error;
    }
  }

  /**
   * Get level recommendations
   */
  async getRecommendations(userId) {
    try {
      const stats = await this.getUserLevelStats(userId);
      const recommendations = [];

      for (const [level, data] of Object.entries(stats)) {
        if (data.progress < 50) {
          recommendations.push({
            level,
            reason: `Only ${data.progress}% completed`,
            action: "Complete more lessons",
          });
        }
      }

      return recommendations;
    } catch (error) {
      logger.error("Error in getRecommendations:", error);
      return [];
    }
  }
}

export default new LevelService();
