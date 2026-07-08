/**
 * lessonRepository.js
 * Path: backend/repositories/lessonRepository.js
 * Description: Lesson repository
 * Changes:
 * - ✅ FIXED: Added countAll method
 * - ✅ FIXED: Added proper error handling
 * - ✅ FIXED: All methods use BaseRepository pattern
 */

import { Op } from "sequelize";
import { Lesson, LessonProgress } from "../models/index.js";
import BaseRepository from "./baseRepository.js";
import logger from "../config/logger.js";

class LessonRepository extends BaseRepository {
  constructor() {
    super(Lesson);
  }

  /**
   * Find active lessons with filters
   */
  async findActive(filters = {}, options = {}) {
    try {
      const {
        level,
        search,
        limit = 50,
        offset = 0,
        order = [
          ["level", "ASC"],
          ["order", "ASC"],
        ],
      } = filters;

      const where = { isActive: true };

      if (level) {
        where.level = level;
      }

      if (search) {
        where[Op.or] = [
          { id: { [Op.iLike]: `%${search}%` } },
          { "$title.fa$": { [Op.iLike]: `%${search}%` } },
          { "$title.en$": { [Op.iLike]: `%${search}%` } },
          { "$title.de$": { [Op.iLike]: `%${search}%` } },
        ];
      }

      const queryOptions = {
        where,
        limit,
        offset,
        order,
        ...options,
      };

      const { rows, count } = await this.model.findAndCountAll(queryOptions);

      return {
        lessons: rows,
        total: count,
        limit,
        offset,
      };
    } catch (error) {
      logger.error(`❌ Error in findActive:`, error);
      return {
        lessons: [],
        total: 0,
        limit: 0,
        offset: 0,
      };
    }
  }

  /**
   * Find lesson by ID with progress for a user
   */
  async findByIdWithProgress(lessonId, userId = null) {
    try {
      if (!lessonId) {
        throw new Error("Lesson ID is required");
      }

      const lesson = await this.findByIdOrFail(lessonId);

      if (!lesson) {
        return null;
      }

      const result = lesson.toJSON();

      if (userId) {
        const progress = await LessonProgress.findOne({
          where: { userId, lessonId },
        });

        result.progress = progress ? progress.toJSON() : null;
      }

      return result;
    } catch (error) {
      logger.error(`❌ Error in findByIdWithProgress:`, error);
      return null;
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

      return progressMap;
    } catch (error) {
      logger.error(`❌ Error in getUserProgress:`, error);
      return {};
    }
  }

  /**
   * ✅ NEW: Count all active lessons
   */
  async countAll(filters = {}) {
    try {
      const where = { isActive: true };

      if (filters.level) {
        where.level = filters.level;
      }

      const count = await this.model.count({ where });
      return count;
    } catch (error) {
      logger.error(`❌ Error in countAll:`, error);
      return 0;
    }
  }

  /**
   * Get lessons by level
   */
  async findByLevel(level, options = {}) {
    try {
      if (!level) {
        throw new Error("Level is required");
      }

      const queryOptions = {
        where: {
          level: level.toUpperCase(),
          isActive: true,
        },
        order: [["order", "ASC"]],
        ...options,
      };

      return await this.model.findAll(queryOptions);
    } catch (error) {
      logger.error(`❌ Error in findByLevel:`, error);
      return [];
    }
  }

  /**
   * Get next lesson
   */
  async getNextLesson(lessonId) {
    try {
      if (!lessonId) {
        return null;
      }

      const lesson = await this.findById(lessonId);
      if (!lesson) {
        return null;
      }

      const nextLesson = await this.model.findOne({
        where: {
          level: lesson.level,
          order: lesson.order + 1,
          isActive: true,
        },
      });

      return nextLesson;
    } catch (error) {
      logger.error(`❌ Error in getNextLesson:`, error);
      return null;
    }
  }

  /**
   * Get previous lesson
   */
  async getPreviousLesson(lessonId) {
    try {
      if (!lessonId) {
        return null;
      }

      const lesson = await this.findById(lessonId);
      if (!lesson) {
        return null;
      }

      const previousLesson = await this.model.findOne({
        where: {
          level: lesson.level,
          order: lesson.order - 1,
          isActive: true,
        },
      });

      return previousLesson;
    } catch (error) {
      logger.error(`❌ Error in getPreviousLesson:`, error);
      return null;
    }
  }

  /**
   * Get lesson levels
   */
  async getLevels() {
    try {
      const levels = await this.model.findAll({
        attributes: [
          [this.model.sequelize.fn("DISTINCT", this.model.sequelize.col("level")), "level"],
        ],
        where: { isActive: true },
        order: [["level", "ASC"]],
        raw: true,
      });

      return levels.map((l) => l.level).filter(Boolean);
    } catch (error) {
      logger.error(`❌ Error in getLevels:`, error);
      return ["A1", "A2", "B1", "B2", "C1", "C2"];
    }
  }
}

export default new LessonRepository();
