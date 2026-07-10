/**
 * progressService.js
 * Path: backend/services/progressService.js
 * Description: Progress tracking service
 * Version: 2.1 - FIXED: Column name compatibility
 * Changes:
 * - ✅ FIXED: completedAt → completed_at (snake_case)
 * - ✅ FIXED: Updated all queries to use correct column names
 * - ✅ FIXED: getDailyActivity now works properly
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
   * ✅ FIXED: N+1 Query - all lessons fetched in one query
   */
  async getUserProgressWithLessons(userId, limit = 50, offset = 0) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      // Get progress records
      const progress = await LessonProgress.findAll({
        where: { userId },
        limit,
        offset,
        order: [["updatedAt", "DESC"]],
      });

      if (progress.length === 0) {
        return {
          progress: [],
          total: 0,
          lessons: {},
        };
      }

      // ✅ FIXED: Get all lesson IDs
      const lessonIds = progress.map((p) => p.lessonId);

      // ✅ FIXED: One query for all lessons
      const lessons = await Lesson.findAll({
        where: {
          id: { [Op.in]: lessonIds },
          isActive: true,
        },
        attributes: ["id", "title", "level", "lessonNumber", "xpReward"],
      });

      // Create map for quick lookup
      const lessonMap = {};
      lessons.forEach((lesson) => {
        lessonMap[lesson.id] = lesson.toJSON();
      });

      // Enrich progress with lesson data
      const enrichedProgress = progress.map((p) => {
        const data = p.toJSON();
        data.lesson = lessonMap[p.lessonId] || null;
        return data;
      });

      const total = await LessonProgress.count({ where: { userId } });

      return {
        progress: enrichedProgress,
        total,
        limit,
        offset,
      };
    } catch (error) {
      logger.error(`❌ Error in getUserProgressWithLessons:`, error);
      return {
        progress: [],
        total: 0,
        lessons: {},
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

      // Add XP to user
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
   * ✅ FIXED: Using snake_case column names
   */
  async getDailyActivity(userId, days = 7) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const date = new Date();
      date.setDate(date.getDate() - days);

      // ✅ FIXED: Use snake_case column names (completed_at)
      const activities = await LessonProgress.findAll({
        where: {
          userId,
          completed_at: {
            [Op.gte]: date,
          },
          status: {
            [Op.in]: ["completed", "perfect"],
          },
        },
        attributes: [
          [
            LessonProgress.sequelize.fn("DATE", LessonProgress.sequelize.col("completed_at")),
            "date",
          ],
          [LessonProgress.sequelize.fn("COUNT", LessonProgress.sequelize.col("id")), "count"],
          [LessonProgress.sequelize.fn("SUM", LessonProgress.sequelize.col("xp_earned")), "xp"],
        ],
        group: [LessonProgress.sequelize.fn("DATE", LessonProgress.sequelize.col("completed_at"))],
        order: [
          [
            LessonProgress.sequelize.fn("DATE", LessonProgress.sequelize.col("completed_at")),
            "ASC",
          ],
        ],
        limit: days,
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

  /**
   * Get user streak
   */
  async getUserStreak(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const user = await User.findByPk(userId);
      return {
        streak: user?.streak || 0,
        longestStreak: user?.longestStreak || 0,
        lastActiveDate: user?.lastActiveDate || null,
      };
    } catch (error) {
      logger.error(`❌ Error in getUserStreak:`, error);
      return {
        streak: 0,
        longestStreak: 0,
        lastActiveDate: null,
      };
    }
  }

  /**
   * Update user streak
   */
  async updateStreak(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;

      if (lastActive) {
        lastActive.setHours(0, 0, 0, 0);
      }

      let streak = user.streak || 0;
      let longestStreak = user.longestStreak || 0;

      if (!lastActive) {
        streak = 1;
      } else {
        const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          // Already active today, do nothing
          return { streak, longestStreak };
        } else if (diffDays === 1) {
          // Consecutive day
          streak += 1;
        } else {
          // Gap in streak, reset to 1
          streak = 1;
        }
      }

      // Update longest streak
      if (streak > longestStreak) {
        longestStreak = streak;
      }

      await user.update({
        streak,
        longestStreak,
        lastActiveDate: today,
      });

      return { streak, longestStreak };
    } catch (error) {
      logger.error(`❌ Error in updateStreak:`, error);
      throw error;
    }
  }
}

export default new ProgressService();
