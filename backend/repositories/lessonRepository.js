/**
 * lessonRepository.js
 * Path: backend/repositories/lessonRepository.js
 * Description: Repository for Lesson model with specific query methods
 * Changes:
 * - ✅ FIXED: Added count method
 * - ✅ FIXED: Replaced isPublished with isActive (matching model)
 * - ✅ All queries now use isActive instead of isPublished
 * - ✅ Added proper error handling
 */

import { Op } from "sequelize";
import Lesson from "../models/Lesson.js";
import BaseRepository from "./baseRepository.js";
import logger from "../config/logger.js";
import { NotFoundError, ValidationError } from "../errors/index.js";

class LessonRepository extends BaseRepository {
  constructor() {
    super(Lesson);
  }

  /**
   * ✅ ADDED: Count lessons with options
   */
  async count(options = {}) {
    try {
      const safeOptions = options || {};
      logger.debug(`📊 Counting Lesson records`, { options: safeOptions });
      const result = await this.model.count(safeOptions);
      logger.debug(`✅ Counted ${result} Lesson records`);
      return result;
    } catch (error) {
      logger.error(`❌ LessonRepository.count error:`, {
        error: error.message,
        stack: error.stack,
        options,
      });
      throw error;
    }
  }

  /**
   * Find lesson by ID with progress
   */
  async findByIdWithProgress(id, userId) {
    try {
      const lesson = await this.model.findByPk(id);
      if (!lesson) {
        logger.debug(`ℹ️ Lesson not found with id: ${id}`);
        return null;
      }

      const lessonData = lesson.toJSON();

      // Get user progress if userId provided
      if (userId) {
        const { LessonProgress } = await import("../models/index.js");
        const progress = await LessonProgress.findOne({
          where: { userId, lessonId: id },
        });
        if (progress) {
          lessonData.progress = progress.toJSON();
        }
      }

      return lessonData;
    } catch (error) {
      logger.error(`❌ LessonRepository.findByIdWithProgress error:`, {
        error: error.message,
        stack: error.stack,
        id,
        userId,
      });
      throw error;
    }
  }

  /**
   * Find lessons by level with pagination
   * ✅ FIXED: Using isActive instead of isPublished
   */
  async findByLevel(level, options = {}) {
    try {
      const { limit = 50, offset = 0 } = options;

      const { count, rows } = await this.model.findAndCountAll({
        where: {
          level: level.toUpperCase(),
          isActive: true,
        },
        limit,
        offset,
        order: [
          ["unit", "ASC"],
          ["lessonNumber", "ASC"],
        ],
      });

      logger.debug(`✅ Found ${rows.length} lessons for level ${level}`);
      return {
        lessons: rows,
        total: count,
        limit,
        offset,
      };
    } catch (error) {
      logger.error(`❌ LessonRepository.findByLevel error:`, {
        error: error.message,
        stack: error.stack,
        level,
        options,
      });
      throw error;
    }
  }

  /**
   * Find active lessons
   * ✅ FIXED: Using isActive instead of isPublished
   */
  async findActive(options = {}) {
    try {
      const { limit = 50, offset = 0, level } = options;

      const where = {
        isActive: true,
      };

      if (level) {
        where.level = level.toUpperCase();
      }

      const { count, rows } = await this.model.findAndCountAll({
        where,
        limit,
        offset,
        order: [
          ["level", "ASC"],
          ["unit", "ASC"],
          ["lessonNumber", "ASC"],
        ],
      });

      logger.debug(`✅ Found ${rows.length} active lessons`);
      return {
        lessons: rows,
        total: count,
        limit,
        offset,
      };
    } catch (error) {
      logger.error(`❌ LessonRepository.findActive error:`, {
        error: error.message,
        stack: error.stack,
        options,
      });
      throw error;
    }
  }

  /**
   * Find lessons with prerequisites
   */
  async findWithPrerequisites(userId, options = {}) {
    try {
      const { limit = 50, offset = 0 } = options;

      const lessons = await this.model.findAll({
        where: {
          isActive: true,
        },
        limit,
        offset,
        order: [
          ["level", "ASC"],
          ["unit", "ASC"],
          ["lessonNumber", "ASC"],
        ],
      });

      logger.debug(`✅ Found ${lessons.length} lessons with prerequisites`);
      return lessons;
    } catch (error) {
      logger.error(`❌ LessonRepository.findWithPrerequisites error:`, {
        error: error.message,
        stack: error.stack,
        userId,
        options,
      });
      throw error;
    }
  }

  /**
   * Find lessons by search query
   */
  async search(query, options = {}) {
    try {
      const { limit = 20, offset = 0, level } = options;

      const where = {
        isActive: true,
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
        ],
      };

      if (level) {
        where.level = level.toUpperCase();
      }

      const { count, rows } = await this.model.findAndCountAll({
        where,
        limit,
        offset,
      });

      logger.debug(`✅ Found ${rows.length} lessons matching search`);
      return {
        lessons: rows,
        total: count,
        limit,
        offset,
      };
    } catch (error) {
      logger.error(`❌ LessonRepository.search error:`, {
        error: error.message,
        stack: error.stack,
        query,
        options,
      });
      throw error;
    }
  }

  /**
   * Get lesson by ID or throw not found
   */
  async findByIdOrFail(id, options = {}) {
    try {
      const lesson = await this.findById(id, options);
      if (!lesson) {
        throw new NotFoundError({
          message: `Lesson with id "${id}" not found`,
          resource: { model: "Lesson", id },
        });
      }
      return lesson;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error(`❌ LessonRepository.findByIdOrFail error:`, {
        error: error.message,
        stack: error.stack,
        id,
        options,
      });
      throw error;
    }
  }

  /**
   * Get user progress for multiple lessons
   */
  async getUserProgress(userId, lessonIds) {
    try {
      if (!userId || !lessonIds || lessonIds.length === 0) {
        return {};
      }

      const { LessonProgress } = await import("../models/index.js");
      const progress = await LessonProgress.findAll({
        where: {
          userId,
          lessonId: { [Op.in]: lessonIds },
        },
      });

      const progressMap = {};
      progress.forEach((p) => {
        progressMap[p.lessonId] = p;
      });

      logger.debug(`✅ Found ${progress.length} progress records for user ${userId}`);
      return progressMap;
    } catch (error) {
      logger.error(`❌ LessonRepository.getUserProgress error:`, {
        error: error.message,
        stack: error.stack,
        userId,
        lessonIds,
      });
      return {};
    }
  }

  /**
   * Get lesson statistics
   */
  async getStats() {
    try {
      const total = await this.model.count({ where: { isActive: true } });

      const byLevel = await this.model.findAll({
        where: { isActive: true },
        attributes: [
          "level",
          [this.model.sequelize.fn("COUNT", this.model.sequelize.col("id")), "count"],
        ],
        group: ["level"],
        order: [["level", "ASC"]],
      });

      const levelStats = {};
      byLevel.forEach((item) => {
        levelStats[item.level] = parseInt(item.get("count"));
      });

      logger.debug(`✅ Lesson stats: total ${total}, byLevel ${Object.keys(levelStats).length}`);
      return {
        total,
        byLevel: levelStats,
      };
    } catch (error) {
      logger.error(`❌ LessonRepository.getStats error:`, {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

export default new LessonRepository();
