/**
 * dictionaryService.js
 * Path: backend/services/dictionaryService.js
 * Description: Dictionary and vocabulary management service
 * Changes:
 * - ✅ FIXED: getAllWords now returns all vocabulary
 * - ✅ FIXED: Proper pagination and filtering
 * - ✅ FIXED: Returns actual data from database
 */

import { Op } from "sequelize";
import { Vocabulary, WordProgress } from "../models/index.js";
import logger from "../config/logger.js";
import sequelize from "../config/db.js";

class DictionaryService {
  /**
   * Get all words with filtering and pagination
   */
  async getAllWords({ userId, level, category, search, limit = 50, offset = 0 }) {
    try {
      logger.info(`📚 Getting dictionary words, limit: ${limit}, offset: ${offset}`);

      const where = { isActive: true };

      if (level) {
        where.level = level;
      }

      if (category) {
        where.category = category;
      }

      if (search) {
        where[Op.or] = [
          { de: { [Op.iLike]: `%${search}%` } },
          { fa: { [Op.iLike]: `%${search}%` } },
          { en: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { rows: words, count: total } = await Vocabulary.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["de", "ASC"]],
      });

      logger.info(`✅ Found ${total} words in dictionary`);

      // Get user progress if userId provided
      let progressMap = {};
      if (userId && words.length > 0) {
        const wordIds = words.map((w) => w.id);
        const progress = await WordProgress.findAll({
          where: {
            userId,
            wordId: { [Op.in]: wordIds },
          },
        });
        progress.forEach((p) => {
          progressMap[p.wordId] = p;
        });
      }

      const result = words.map((word) => {
        const wordJson = word.toJSON();
        return {
          ...wordJson,
          progress: progressMap[word.id] || null,
          isSaved: !!progressMap[word.id],
        };
      });

      return {
        words: result,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      };
    } catch (error) {
      logger.error("❌ Error in getAllWords:", error);
      return {
        words: [],
        total: 0,
        limit: 50,
        offset: 0,
      };
    }
  }

  /**
   * Search words (alias for getAllWords with search)
   */
  async searchWords(query, { level, category, limit = 20, offset = 0 }) {
    return this.getAllWords({
      userId: null,
      level,
      category,
      search: query,
      limit,
      offset,
    });
  }

  /**
   * Get word by ID
   */
  async getWordById(wordId, userId) {
    try {
      const word = await Vocabulary.findByPk(wordId);
      if (!word) return null;

      let progress = null;
      if (userId) {
        progress = await WordProgress.findOne({
          where: { userId, wordId },
        });
      }

      return {
        ...word.toJSON(),
        progress,
        isSaved: !!progress,
      };
    } catch (error) {
      logger.error("❌ Error in getWordById:", error);
      return null;
    }
  }

  /**
   * Get categories with counts
   */
  async getCategories() {
    try {
      const categories = await Vocabulary.findAll({
        attributes: ["category", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
        where: { isActive: true },
        group: ["category"],
        order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
      });

      return categories.map((c) => ({
        name: c.category || "general",
        count: parseInt(c.get("count")),
      }));
    } catch (error) {
      logger.error("❌ Error in getCategories:", error);
      return [];
    }
  }

  /**
   * Save word for user
   */
  async saveWord(userId, wordId) {
    try {
      const [progress, created] = await WordProgress.findOrCreate({
        where: { userId, wordId },
        defaults: {
          userId,
          wordId,
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
        },
      });

      return progress;
    } catch (error) {
      logger.error("❌ Error in saveWord:", error);
      throw error;
    }
  }

  /**
   * Remove saved word
   */
  async removeSavedWord(userId, wordId) {
    try {
      const deleted = await WordProgress.destroy({
        where: { userId, wordId },
      });
      return deleted;
    } catch (error) {
      logger.error("❌ Error in removeSavedWord:", error);
      return 0;
    }
  }

  /**
   * Get saved words for user
   */
  async getSavedWords(userId) {
    try {
      const progress = await WordProgress.findAll({
        where: { userId },
        include: [
          {
            model: Vocabulary,
            as: "vocabulary",
            where: { isActive: true },
            required: false,
          },
        ],
        order: [["nextReviewDate", "ASC"]],
      });

      return progress
        .filter((p) => p.vocabulary)
        .map((p) => ({
          ...p.vocabulary.toJSON(),
          progress: {
            easeFactor: p.easeFactor,
            interval: p.interval,
            repetitions: p.repetitions,
            lastReviewDate: p.lastReviewDate,
            nextReviewDate: p.nextReviewDate,
          },
        }));
    } catch (error) {
      logger.error("❌ Error in getSavedWords:", error);
      return [];
    }
  }
}

export default new DictionaryService();
