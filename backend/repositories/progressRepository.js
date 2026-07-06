/**
 * progressRepository.js
 * Path: backend/repositories/progressRepository.js
 * Description: Repository for LessonProgress model
 * Changes:
 * - Integrated custom Error Classes
 * - Replaced plain errors with ValidationError and NotFoundError
 * - Better use of BaseRepository methods
 * - Added findByUserAndLessonOrFail method
 * - Added getUserProgressSummary method
 * - Improved logging and error handling
 */

import { Op } from "sequelize";
import LessonProgress from "../models/LessonProgress.js";
import Lesson from "../models/Lesson.js";
import BaseRepository from "./baseRepository.js";
import logger from "../config/logger.js";
import { ValidationError, NotFoundError } from "../errors/index.js";

class ProgressRepository extends BaseRepository {
  constructor() {
    super(LessonProgress);
  }

  /**
   * Find progress for a user and multiple lessons
   * @param {string} userId - User ID
   * @param {Array} lessonIds - Array of lesson IDs
   * @param {Object} options - Additional query options
   * @returns {Promise<Array>} List of progress records
   */
  async findByUserAndLessons(userId, lessonIds, options = {}) {
    try {
      if (!userId) {
        logger.warn("⚠️ findByUserAndLessons called without userId");
        return [];
      }

      if (!lessonIds || lessonIds.length === 0) {
        logger.debug("ℹ️ No lesson IDs provided for progress fetch");
        return [];
      }

      logger.debug(`📊 Finding progress for user ${userId} and ${lessonIds.length} lessons`);

      const queryOptions = {
        where: {
          userId,
          lessonId: {
            [Op.in]: lessonIds,
          },
        },
        ...options,
      };

      const progress = await this.model.findAll(queryOptions);

      logger.debug(`✅ Found ${progress.length} progress records for user ${userId}`);
      return progress;
    } catch (error) {
      logger.error(`❌ ProgressRepository.findByUserAndLessons error:`, {
        userId,
        lessonCount: lessonIds?.length,
        error: error.message,
        stack: error.stack,
      });
      // Return empty array to prevent cascading failures
      return [];
    }
  }

  /**
   * Find progress for a user and a single lesson
   * @param {string} userId - User ID
   * @param {string} lessonId - Lesson ID
   * @param {Object} options - Additional query options
   * @returns {Promise<Object|null>} Progress record or null
   */
  async findByUserAndLesson(userId, lessonId, options = {}) {
    try {
      if (!userId) {
        logger.warn("⚠️ findByUserAndLesson called without userId");
        return null;
      }

      if (!lessonId) {
        logger.warn("⚠️ findByUserAndLesson called without lessonId");
        return null;
      }

      logger.debug(`📊 Finding progress for user ${userId} and lesson ${lessonId}`);

      const queryOptions = {
        where: {
          userId,
          lessonId,
        },
        ...options,
      };

      const progress = await this.model.findOne(queryOptions);

      if (!progress) {
        logger.debug(`ℹ️ No progress found for user ${userId} and lesson ${lessonId}`);
        return null;
      }

      return progress;
    } catch (error) {
      logger.error(`❌ ProgressRepository.findByUserAndLesson error:`, {
        userId,
        lessonId,
        error: error.message,
        stack: error.stack,
      });
      return null;
    }
  }

  /**
   * Find progress for a user and a single lesson or throw not found
   * @param {string} userId - User ID
   * @param {string} lessonId - Lesson ID
   * @param {Object} options - Additional query options
   * @returns {Promise<Object>} Progress record
   * @throws {NotFoundError} If progress not found
   */
  async findByUserAndLessonOrFail(userId, lessonId, options = {}) {
    const progress = await this.findByUserAndLesson(userId, lessonId, options);
    if (!progress) {
      throw new NotFoundError({
        message: `Progress not found for user ${userId} and lesson ${lessonId}`,
        resource: { model: "LessonProgress", userId, lessonId },
      });
    }
    return progress;
  }

  /**
   * Find all progress for a user
   * @param {string} userId - User ID
   * @param {Object} options - Additional query options
   * @returns {Promise<Array>} List of progress records
   * @throws {ValidationError} If userId is not provided
   */
  async findByUser(userId, options = {}) {
    try {
      if (!userId) {
        throw new ValidationError({
          message: "User ID is required",
          details: [{ field: "userId", message: "User ID is required" }],
        });
      }

      logger.debug(`📊 Finding all progress for user ${userId}`);

      const queryOptions = {
        where: { userId },
        ...options,
        order: [["updatedAt", "DESC"]],
      };

      const progress = await this.model.findAll(queryOptions);

      logger.debug(`✅ Found ${progress.length} progress records for user ${userId}`);
      return progress;
    } catch (error) {
      logger.error(`❌ ProgressRepository.findByUser error:`, {
        userId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Find progress by user and status
   * @param {string} userId - User ID
   * @param {Array} statuses - Array of status values
   * @param {Object} options - Additional query options
   * @returns {Promise<Array>} List of progress records
   * @throws {ValidationError} If userId is not provided
   */
  async findByUserAndStatus(userId, statuses, options = {}) {
    try {
      if (!userId) {
        throw new ValidationError({
          message: "User ID is required",
          details: [{ field: "userId", message: "User ID is required" }],
        });
      }

      if (!statuses || statuses.length === 0) {
        logger.warn("⚠️ findByUserAndStatus called without statuses");
        return [];
      }

      const queryOptions = {
        where: {
          userId,
          status: {
            [Op.in]: statuses,
          },
        },
        ...options,
        order: [["updatedAt", "DESC"]],
      };

      logger.debug(`📊 Finding progress for user ${userId} with statuses:`, statuses);

      const progress = await this.model.findAll(queryOptions);

      logger.debug(`✅ Found ${progress.length} progress records for user ${userId}`);
      return progress;
    } catch (error) {
      logger.error(`❌ ProgressRepository.findByUserAndStatus error:`, {
        userId,
        statuses,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Count progress by user and status
   * @param {string} userId - User ID
   * @param {Array} statuses - Array of status values
   * @param {Object} options - Additional query options
   * @returns {Promise<number>} Count
   * @throws {ValidationError} If userId is not provided
   */
  async countByUserAndStatus(userId, statuses, options = {}) {
    try {
      if (!userId) {
        throw new ValidationError({
          message: "User ID is required",
          details: [{ field: "userId", message: "User ID is required" }],
        });
      }

      if (!statuses || statuses.length === 0) {
        return 0;
      }

      const queryOptions = {
        where: {
          userId,
          status: {
            [Op.in]: statuses,
          },
        },
        ...options,
      };

      logger.debug(`📊 Counting progress for user ${userId} with statuses:`, statuses);

      const count = await this.model.count(queryOptions);

      logger.debug(`✅ Found ${count} progress records for user ${userId}`);
      return count;
    } catch (error) {
      logger.error(`❌ ProgressRepository.countByUserAndStatus error:`, {
        userId,
        statuses,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Find last progress record for a user
   * @param {string} userId - User ID
   * @param {Object} options - Additional query options
   * @returns {Promise<Object|null>} Last progress record or null
   * @throws {ValidationError} If userId is not provided
   */
  async findLastByUser(userId, options = {}) {
    try {
      if (!userId) {
        throw new ValidationError({
          message: "User ID is required",
          details: [{ field: "userId", message: "User ID is required" }],
        });
      }

      logger.debug(`📊 Finding last progress for user ${userId}`);

      const queryOptions = {
        where: { userId },
        ...options,
        order: [["updatedAt", "DESC"]],
        limit: 1,
      };

      const results = await this.model.findAll(queryOptions);

      if (results.length === 0) {
        logger.debug(`ℹ️ No progress found for user ${userId}`);
        return null;
      }

      return results[0];
    } catch (error) {
      logger.error(`❌ ProgressRepository.findLastByUser error:`, {
        userId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Find progress by user and level (requires join with Lesson)
   * @param {string} userId - User ID
   * @param {string} level - Level
   * @param {Object} options - Additional query options
   * @returns {Promise<Array>} List of progress records with lesson data
   * @throws {ValidationError} If userId or level is not provided
   */
  async findByUserAndLevel(userId, level, options = {}) {
    try {
      if (!userId) {
        throw new ValidationError({
          message: "User ID is required",
          details: [{ field: "userId", message: "User ID is required" }],
        });
      }

      if (!level) {
        throw new ValidationError({
          message: "Level is required",
          details: [{ field: "level", message: "Level is required" }],
        });
      }

      logger.debug(`📊 Finding progress for user ${userId} and level ${level}`);

      const queryOptions = {
        where: { userId },
        include: [
          {
            model: Lesson,
            as: "lesson",
            where: { level: level.toUpperCase() },
            required: true,
          },
        ],
        ...options,
        order: [["updatedAt", "DESC"]],
      };

      const progress = await this.model.findAll(queryOptions);

      logger.debug(
        `✅ Found ${progress.length} progress records for user ${userId} and level ${level}`
      );
      return progress;
    } catch (error) {
      logger.error(`❌ ProgressRepository.findByUserAndLevel error:`, {
        userId,
        level,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Get user progress summary
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Progress summary
   * @throws {ValidationError} If userId is not provided
   */
  async getUserProgressSummary(userId) {
    try {
      if (!userId) {
        throw new ValidationError({
          message: "User ID is required",
          details: [{ field: "userId", message: "User ID is required" }],
        });
      }

      logger.debug(`📊 Getting progress summary for user ${userId}`);

      const [totalLessons, completedLessons, perfectLessons, inProgressLessons] = await Promise.all(
        [
          this.model.count({ where: { userId } }),
          this.model.count({
            where: {
              userId,
              status: {
                [Op.in]: ["completed", "perfect"],
              },
            },
          }),
          this.model.count({
            where: {
              userId,
              status: "perfect",
            },
          }),
          this.model.count({
            where: {
              userId,
              status: "in_progress",
            },
          }),
        ]
      );

      const totalXP = await this.model.sum("xpEarned", {
        where: { userId },
      });

      const averageScoreResult = await this.model.findAll({
        where: { userId },
        attributes: [
          [this.model.sequelize.fn("AVG", this.model.sequelize.col("score")), "averageScore"],
        ],
        raw: true,
      });

      const averageScore = averageScoreResult[0]?.averageScore || 0;

      const summary = {
        totalLessons: totalLessons || 0,
        completedLessons: completedLessons || 0,
        perfectLessons: perfectLessons || 0,
        inProgressLessons: inProgressLessons || 0,
        totalXP: totalXP || 0,
        averageScore: Math.round(averageScore),
        completionRate: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      };

      logger.debug(`✅ Progress summary for user ${userId}:`, summary);
      return summary;
    } catch (error) {
      logger.error(`❌ ProgressRepository.getUserProgressSummary error:`, {
        userId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Get completed lessons with details
   * @param {string} userId - User ID
   * @param {number} limit - Max number of records
   * @param {Object} options - Additional query options
   * @returns {Promise<Array>} List of completed progress records
   */
  async getCompletedLessons(userId, limit = 20, options = {}) {
    try {
      if (!userId) {
        throw new ValidationError({
          message: "User ID is required",
          details: [{ field: "userId", message: "User ID is required" }],
        });
      }

      logger.debug(`📊 Getting completed lessons for user ${userId}`);

      const queryOptions = {
        where: {
          userId,
          status: {
            [Op.in]: ["completed", "perfect"],
          },
          completedAt: {
            [Op.ne]: null,
          },
        },
        ...options,
        order: [["completedAt", "DESC"]],
        limit,
      };

      const progress = await this.model.findAll(queryOptions);

      logger.debug(`✅ Found ${progress.length} completed lessons for user ${userId}`);
      return progress;
    } catch (error) {
      logger.error(`❌ ProgressRepository.getCompletedLessons error:`, {
        userId,
        limit,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Get in-progress lessons
   * @param {string} userId - User ID
   * @param {number} limit - Max number of records
   * @param {Object} options - Additional query options
   * @returns {Promise<Array>} List of in-progress progress records
   */
  async getInProgressLessons(userId, limit = 10, options = {}) {
    try {
      if (!userId) {
        throw new ValidationError({
          message: "User ID is required",
          details: [{ field: "userId", message: "User ID is required" }],
        });
      }

      logger.debug(`📊 Getting in-progress lessons for user ${userId}`);

      const queryOptions = {
        where: {
          userId,
          status: "in_progress",
        },
        ...options,
        order: [["updatedAt", "DESC"]],
        limit,
      };

      const progress = await this.model.findAll(queryOptions);

      logger.debug(`✅ Found ${progress.length} in-progress lessons for user ${userId}`);
      return progress;
    } catch (error) {
      logger.error(`❌ ProgressRepository.getInProgressLessons error:`, {
        userId,
        limit,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Check if user has completed a lesson
   * @param {string} userId - User ID
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<boolean>} True if completed
   */
  async isLessonCompleted(userId, lessonId) {
    try {
      if (!userId || !lessonId) {
        return false;
      }

      const progress = await this.model.findOne({
        where: {
          userId,
          lessonId,
          status: {
            [Op.in]: ["completed", "perfect"],
          },
        },
        attributes: ["id"],
      });

      return !!progress;
    } catch (error) {
      logger.error(`❌ ProgressRepository.isLessonCompleted error:`, {
        userId,
        lessonId,
        error: error.message,
        stack: error.stack,
      });
      return false;
    }
  }

  /**
   * Upsert (create or update) progress
   * @param {string} userId - User ID
   * @param {string} lessonId - Lesson ID
   * @param {Object} data - Progress data
   * @param {Object} options - Additional query options
   * @returns {Promise<Object>} { progress, created }
   * @throws {ValidationError} If userId or lessonId is not provided
   */
  async upsert(userId, lessonId, data, options = {}) {
    try {
      if (!userId) {
        throw new ValidationError({
          message: "User ID is required",
          details: [{ field: "userId", message: "User ID is required" }],
        });
      }

      if (!lessonId) {
        throw new ValidationError({
          message: "Lesson ID is required",
          details: [{ field: "lessonId", message: "Lesson ID is required" }],
        });
      }

      logger.debug(`📊 Upserting progress for user ${userId} and lesson ${lessonId}`);

      const [progress, created] = await this.model.findOrCreate({
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
        ...options,
      });

      if (!created) {
        // Update existing progress
        await progress.update(data, options);
        logger.debug(`✅ Progress updated for user ${userId} and lesson ${lessonId}`);
      } else {
        logger.debug(`✅ Progress created for user ${userId} and lesson ${lessonId}`);
      }

      return { progress, created };
    } catch (error) {
      logger.error(`❌ ProgressRepository.upsert error:`, {
        userId,
        lessonId,
        error: error.message,
        stack: error.stack,
        data,
      });
      throw error;
    }
  }

  /**
   * Delete all progress for a lesson (for cleanup)
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<number>} Number of deleted records
   * @throws {ValidationError} If lessonId is not provided
   */
  async deleteByLesson(lessonId) {
    try {
      if (!lessonId) {
        throw new ValidationError({
          message: "Lesson ID is required",
          details: [{ field: "lessonId", message: "Lesson ID is required" }],
        });
      }

      logger.debug(`🗑️ Deleting all progress for lesson ${lessonId}`);

      const deleted = await this.model.destroy({
        where: { lessonId },
      });

      logger.info(`✅ Deleted ${deleted} progress records for lesson ${lessonId}`);
      return deleted;
    } catch (error) {
      logger.error(`❌ ProgressRepository.deleteByLesson error:`, {
        lessonId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Get user's recent activity
   * @param {string} userId - User ID
   * @param {number} days - Number of days to look back
   * @returns {Promise<Array>} Daily activity data
   */
  async getRecentActivity(userId, days = 7) {
    try {
      if (!userId) {
        throw new ValidationError({
          message: "User ID is required",
          details: [{ field: "userId", message: "User ID is required" }],
        });
      }

      const date = new Date();
      date.setDate(date.getDate() - days);

      logger.debug(`📊 Getting recent activity for user ${userId} (${days} days)`);

      const progress = await this.model.findAll({
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
          [this.model.sequelize.fn("DATE", this.model.sequelize.col("completedAt")), "date"],
          [this.model.sequelize.fn("COUNT", this.model.sequelize.col("id")), "count"],
          [this.model.sequelize.fn("SUM", this.model.sequelize.col("xpEarned")), "xp"],
        ],
        group: [this.model.sequelize.fn("DATE", this.model.sequelize.col("completedAt"))],
        order: [[this.model.sequelize.fn("DATE", this.model.sequelize.col("completedAt")), "ASC"]],
      });

      return progress;
    } catch (error) {
      logger.error(`❌ ProgressRepository.getRecentActivity error:`, {
        userId,
        days,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

export default new ProgressRepository();
