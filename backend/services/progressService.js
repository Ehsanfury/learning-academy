/**
 * progressService.js
 * Path: backend/services/progressService.js
 * Description: Progress tracking service
 * Changes:
 * - ✅ FIXED: Removed countAll() - using Lesson.count() directly
 * - ✅ FIXED: N+1 Query - fetching all lessons in one query
 * - ✅ FIXED: Added LIMIT to all unbounded queries
 * - ✅ FIXED: Added proper error handling
 */

import { Op } from "sequelize";
import { Lesson, LessonProgress, User } from "../models/index.js";
import lessonRepository from "../repositories/lessonRepository.js";
import progressRepository from "../repositories/progressRepository.js";
import userService from "./userService.js";
import logger from "../config/logger.js";

class ProgressService {
  /**
   * Get user progress summary
   */
  async getUserProgressSummary(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const totalLessons = await Lesson.count({
        where: { isActive: true },
      });

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

      const inProgress = await LessonProgress.count({
        where: {
          userId,
          status: "in_progress",
        },
      });

      const user = await User.findByPk(userId);
      const totalXP = user?.xp || 0;

      return {
        totalLessons: totalLessons || 0,
        completedLessons: completedLessons || 0,
        perfectLessons: perfectLessons || 0,
        inProgress: inProgress || 0,
        totalXP,
        completionRate: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      };
    } catch (error) {
      logger.error(`❌ Error in getUserProgressSummary:`, error);
      return {
        totalLessons: 0,
        completedLessons: 0,
        perfectLessons: 0,
        inProgress: 0,
        totalXP: 0,
        completionRate: 0,
      };
    }
  }

  /**
   * Get user progress with lesson details
   * ✅ FIXED: Added limit for unbounded queries
   */
  async getUserProgressWithLessons(userId, limit = 50, offset = 0) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const safeLimit = Math.min(parseInt(limit) || 50, 100);

      const progress = await LessonProgress.findAll({
        where: { userId },
        limit: safeLimit,
        offset: parseInt(offset) || 0,
        order: [["updatedAt", "DESC"]],
      });

      if (progress.length === 0) {
        return {
          progress: [],
          total: 0,
          limit: safeLimit,
          offset: parseInt(offset) || 0,
        };
      }

      const lessonIds = progress.map((p) => p.lessonId);

      const lessons = await Lesson.findAll({
        where: {
          id: { [Op.in]: lessonIds },
          isActive: true,
        },
        attributes: ["id", "title", "level", "lessonNumber", "xpReward"],
      });

      const lessonMap = {};
      lessons.forEach((lesson) => {
        lessonMap[lesson.id] = lesson.toJSON();
      });

      const enrichedProgress = progress.map((p) => {
        const data = p.toJSON();
        data.lesson = lessonMap[p.lessonId] || null;
        return data;
      });

      const total = await LessonProgress.count({ where: { userId } });

      return {
        progress: enrichedProgress,
        total,
        limit: safeLimit,
        offset: parseInt(offset) || 0,
      };
    } catch (error) {
      logger.error(`❌ Error in getUserProgressWithLessons:`, error);
      return {
        progress: [],
        total: 0,
        limit: 50,
        offset: 0,
      };
    }
  }

  /**
   * Get user progress for a specific lesson
   */
  async getLessonProgress(userId, lessonId) {
    try {
      if (!userId || !lessonId) {
        throw new Error("User ID and Lesson ID are required");
      }

      const progress = await LessonProgress.findOne({
        where: { userId, lessonId },
      });

      if (!progress) {
        return {
          status: "not_started",
          score: 0,
          xpEarned: 0,
          completedAt: null,
        };
      }

      return progress.toJSON();
    } catch (error) {
      logger.error(`❌ Error in getLessonProgress:`, error);
      throw error;
    }
  }

  /**
   * Update or create progress for a lesson
   */
  async updateProgress(userId, lessonId, data) {
    try {
      if (!userId || !lessonId) {
        throw new Error("User ID and Lesson ID are required");
      }

      const [progress, created] = await LessonProgress.findOrCreate({
        where: { userId, lessonId },
        defaults: {
          userId,
          lessonId,
          status: "not_started",
          score: 0,
          xpEarned: 0,
          answers: {},
          ...data,
        },
      });

      if (!created) {
        await progress.update(data);
      }

      return progress;
    } catch (error) {
      logger.error(`❌ Error in updateProgress:`, error);
      throw error;
    }
  }

  /**
   * Complete a lesson
   */
  async completeLesson(userId, lessonId, score, xpEarned, answers = {}) {
    try {
      if (!userId || !lessonId) {
        throw new Error("User ID and Lesson ID are required");
      }

      const status = score === 100 ? "perfect" : "completed";

      const progress = await this.updateProgress(userId, lessonId, {
        status,
        score,
        xpEarned,
        answers,
        completedAt: new Date(),
      });

      if (xpEarned > 0) {
        await userService.addXP(userId, xpEarned, "lesson_completion");
      }

      return progress;
    } catch (error) {
      logger.error(`❌ Error in completeLesson:`, error);
      throw error;
    }
  }

  /**
   * Get user's daily activity
   * ✅ FIXED: Added limit for unbounded queries
   */
  async getDailyActivity(userId, days = 7) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const safeDays = Math.min(parseInt(days) || 7, 30);

      const date = new Date();
      date.setDate(date.getDate() - safeDays);

      const activities = await LessonProgress.findAll({
        where: {
          userId,
          completedAt: {
            [Op.gte]: date,
          },
          status: {
            [Op.in]: ["completed", "perfect"],
          },
        },
        attributes: [
          [
            LessonProgress.sequelize.fn("DATE", LessonProgress.sequelize.col("completedAt")),
            "date",
          ],
          [LessonProgress.sequelize.fn("COUNT", LessonProgress.sequelize.col("id")), "count"],
          [LessonProgress.sequelize.fn("SUM", LessonProgress.sequelize.col("xpEarned")), "xp"],
        ],
        group: [LessonProgress.sequelize.fn("DATE", LessonProgress.sequelize.col("completedAt"))],
        order: [
          [LessonProgress.sequelize.fn("DATE", LessonProgress.sequelize.col("completedAt")), "ASC"],
        ],
        limit: safeDays,
      });

      return activities;
    } catch (error) {
      logger.error(`❌ Error in getDailyActivity:`, error);
      return [];
    }
  }

  /**
   * Get user's progress stats by level
   */
  async getProgressByLevel(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
      const result = [];

      for (const level of levels) {
        const total = await Lesson.count({
          where: { level, isActive: true },
        });

        const completed = await LessonProgress.count({
          where: {
            userId,
            status: {
              [Op.in]: ["completed", "perfect"],
            },
          },
          include: [
            {
              model: Lesson,
              as: "lesson",
              where: { level },
              required: true,
            },
          ],
        });

        result.push({
          level,
          total,
          completed,
          progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        });
      }

      return result;
    } catch (error) {
      logger.error(`❌ Error in getProgressByLevel:`, error);
      return [];
    }
  }
}

export default new ProgressService();
