/**
 * vocabularyController.js
 * Path: backend/controllers/vocabularyController.js
 * Description: Vocabulary controller for flashcards and dictionary
 * Changes:
 * - ✅ M5: Merged dictionaryController functionality into vocabularyController
 * - ✅ M6: Fixed N+1 with single query
 * - ✅ Fixed duplicate getCategories declaration
 * - ✅ Using asyncHandler for consistency
 * - ✅ Added proper error handling
 */

import { Op } from "sequelize";
import sequelize from "../config/db.js";
import Vocabulary from "../models/Vocabulary.js";
import WordProgress from "../models/WordProgress.js";
import { logInfo, logError, logWarn } from "../config/logger.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import {
  validateVocabularyReview,
  validateGetWords,
  validateSearch,
  validateSaveWord,
} from "../validators/vocabulary.validator.js";
import { ValidationError, NotFoundError } from "../errors/index.js";

// ============================================
// 📖 Word Management (from vocabularyController)
// ============================================

/**
 * Get words list
 * GET /api/vocabulary/words
 */
export const getWords = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { level, category, limit = 50 } = req.query;

  logInfo("📖 [Vocabulary] Getting words", { userId, level, category, limit });

  const validation = validateGetWords(req.query);
  if (!validation.valid) {
    throw new ValidationError({
      message: "Validation failed",
      details: validation.errors,
    });
  }

  const where = {};
  if (level) where.level = level.toUpperCase();
  if (category) where.category = category;

  const words = await Vocabulary.findAll({
    where,
    limit: parseInt(limit),
    order: [["de", "ASC"]],
  });

  const wordIds = words.map((w) => w.id);
  const progress = await WordProgress.findAll({
    where: {
      userId,
      wordId: wordIds,
    },
  });

  const progressMap = {};
  progress.forEach((p) => {
    progressMap[p.wordId] = p;
  });

  const result = words.map((word) => {
    const wordData = word.toJSON();
    const wordProgress = progressMap[word.id];
    return {
      ...wordData,
      progress: wordProgress
        ? {
            easeFactor: wordProgress.easeFactor,
            interval: wordProgress.interval,
            repetitions: wordProgress.repetitions,
            nextReviewDate: wordProgress.nextReviewDate,
          }
        : null,
    };
  });

  logInfo("✅ [Vocabulary] Words fetched", {
    userId,
    count: result.length,
  });

  res.json({
    success: true,
    data: result,
    count: result.length,
  });
});

/**
 * Get word by ID
 * GET /api/vocabulary/words/:id
 */
export const getWordById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  logInfo("📖 [Vocabulary] Getting word by id", { userId, wordId: id });

  const word = await Vocabulary.findByPk(id);
  if (!word) {
    throw new NotFoundError({
      message: "Word not found",
      resource: { model: "Vocabulary", id },
    });
  }

  const progress = await WordProgress.findOne({
    where: { userId, wordId: id },
  });

  const result = {
    ...word.toJSON(),
    progress: progress || null,
  };

  logInfo("✅ [Vocabulary] Word fetched", { userId, wordId: id });

  res.json({
    success: true,
    data: result,
  });
});

// ============================================
// 🔍 Dictionary Search (from dictionaryController)
// ============================================

/**
 * Search words
 * GET /api/vocabulary/search
 * ✅ M5: Merged from dictionaryController
 */
export const searchWords = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { q, level, category, limit = 20, offset = 0 } = req.query;

  logInfo("🔍 [Vocabulary] Searching words", {
    userId: userId || "guest",
    query: q,
    level,
    category,
  });

  const validation = validateSearch(req.query);
  if (!validation.valid) {
    throw new ValidationError({
      message: "Validation failed",
      details: validation.errors,
    });
  }

  const whereClause = {
    [Op.or]: [
      { de: { [Op.iLike]: `%${q}%` } },
      { fa: { [Op.iLike]: `%${q}%` } },
      { en: { [Op.iLike]: `%${q}%` } },
    ],
  };

  if (level) whereClause.level = level;
  if (category) whereClause.category = category;

  const { count, rows } = await Vocabulary.findAndCountAll({
    where: whereClause,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["de", "ASC"]],
  });

  logInfo("✅ [Vocabulary] Search completed", {
    userId: userId || "guest",
    total: count,
    results: rows.length,
  });

  res.json({
    success: true,
    data: {
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset),
      results: rows,
    },
  });
});

// ============================================
// 📂 Categories - ✅ M6: Fixed N+1 with single query
// ============================================

/**
 * Get vocabulary categories
 * GET /api/vocabulary/categories
 * ✅ M6: Fixed N+1 with single query
 * ✅ Fixed duplicate declaration - only one getCategories
 */
export const getCategories = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  logInfo("📂 [Vocabulary] Getting categories", { userId });

  const categories = [
    { id: "greetings", name: { fa: "سلام و احوالپرسی", en: "Greetings" }, icon: "👋" },
    { id: "food", name: { fa: "غذا و نوشیدنی", en: "Food & Drink" }, icon: "🍽️" },
    { id: "family", name: { fa: "خانواده", en: "Family" }, icon: "👨‍👩‍👧" },
    { id: "transport", name: { fa: "حمل و نقل", en: "Transport" }, icon: "🚗" },
    { id: "housing", name: { fa: "مسکن", en: "Housing" }, icon: "🏠" },
    { id: "work", name: { fa: "کار", en: "Work" }, icon: "💼" },
    { id: "education", name: { fa: "تحصیلات", en: "Education" }, icon: "📚" },
    { id: "health", name: { fa: "سلامتی", en: "Health" }, icon: "🏥" },
    { id: "shopping", name: { fa: "خرید", en: "Shopping" }, icon: "🛒" },
    { id: "adjectives", name: { fa: "صفت‌ها", en: "Adjectives" }, icon: "🎨" },
    { id: "animals", name: { fa: "حیوانات", en: "Animals" }, icon: "🐕" },
    { id: "nature", name: { fa: "طبیعت", en: "Nature" }, icon: "🌿" },
    { id: "colors", name: { fa: "رنگ‌ها", en: "Colors" }, icon: "🌈" },
  ];

  // ✅ M6: Single query for all categories
  const categoryIds = categories.map((c) => c.id);
  const counts = await Vocabulary.findAll({
    attributes: ["category", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
    where: {
      category: {
        [Op.in]: categoryIds,
      },
    },
    group: ["category"],
  });

  const countMap = {};
  counts.forEach((item) => {
    countMap[item.category] = parseInt(item.get("count"));
  });

  // ✅ M6: Set counts from single query
  categories.forEach((cat) => {
    cat.count = countMap[cat.id] || 0;
  });

  logInfo("✅ [Vocabulary] Categories fetched", {
    userId,
    count: categories.length,
  });

  res.json({
    success: true,
    data: categories,
  });
});

// ============================================
// 💾 Saved Words (from vocabularyController)
// ============================================

/**
 * Save word to user list
 * POST /api/vocabulary/saved/:wordId
 */
export const saveWord = asyncHandler(async (req, res) => {
  const { wordId } = req.params;
  const userId = req.user.id;

  logInfo("💾 [Vocabulary] Saving word for user", { userId, wordId });

  const validation = validateSaveWord(req.params);
  if (!validation.valid) {
    throw new ValidationError({
      message: "Validation failed",
      details: validation.errors,
    });
  }

  const word = await Vocabulary.findByPk(wordId);
  if (!word) {
    throw new NotFoundError({
      message: "Word not found",
      resource: { model: "Vocabulary", id: wordId },
    });
  }

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

  logInfo("✅ [Vocabulary] Word saved", {
    userId,
    wordId,
    created,
  });

  res.json({
    success: true,
    message: created ? "Word saved successfully" : "Word already saved",
    data: progress,
  });
});

/**
 * Remove word from user list
 * DELETE /api/vocabulary/saved/:wordId
 */
export const removeWord = asyncHandler(async (req, res) => {
  const { wordId } = req.params;
  const userId = req.user.id;

  logInfo("🗑️ [Vocabulary] Removing word from user list", { userId, wordId });

  const deleted = await WordProgress.destroy({
    where: { userId, wordId },
  });

  if (deleted === 0) {
    throw new NotFoundError({
      message: "Word not found in saved list",
      resource: { model: "WordProgress", userId, wordId },
    });
  }

  logInfo("✅ [Vocabulary] Word removed", { userId, wordId });

  res.json({
    success: true,
    message: "Word removed successfully",
  });
});

/**
 * Get user saved words
 * GET /api/vocabulary/saved
 */
export const getSavedWords = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  logInfo("📚 [Vocabulary] Getting saved words", { userId });

  const savedWords = await WordProgress.findAll({
    where: { userId },
    include: [
      {
        model: Vocabulary,
        as: "vocabulary",
        required: true,
      },
    ],
    order: [["nextReviewDate", "ASC"]],
  });

  const result = savedWords.map((sw) => ({
    ...sw.vocabulary.toJSON(),
    progress: {
      easeFactor: sw.easeFactor,
      interval: sw.interval,
      repetitions: sw.repetitions,
      nextReviewDate: sw.nextReviewDate,
    },
  }));

  logInfo("✅ [Vocabulary] Saved words fetched", {
    userId,
    count: result.length,
  });

  res.json({
    success: true,
    data: result,
    count: result.length,
  });
});

/**
 * Review word
 * POST /api/vocabulary/review/:wordId
 */
export const reviewWord = asyncHandler(async (req, res) => {
  const { wordId } = req.params;
  const userId = req.user.id;
  const { quality } = req.body;

  logInfo("🔄 [Vocabulary] Reviewing word", { userId, wordId, quality });

  const validation = validateVocabularyReview(req.body);
  if (!validation.valid) {
    throw new ValidationError({
      message: "Validation failed",
      details: validation.errors,
    });
  }

  const word = await Vocabulary.findByPk(wordId);
  if (!word) {
    throw new NotFoundError({
      message: "Word not found for review",
      resource: { model: "Vocabulary", id: wordId },
    });
  }

  // ✅ M2: Use spacedRepetitionService (single source of truth)
  const spacedRepetitionService = (await import("../services/spacedRepetitionService.js")).default;
  const progress = await spacedRepetitionService.reviewWord(userId, wordId, quality);

  logInfo("✅ [Vocabulary] Word reviewed", {
    userId,
    wordId,
    quality,
    nextReviewDate: progress.nextReviewDate,
  });

  res.json({
    success: true,
    message: "Word reviewed successfully",
    data: progress,
  });
});

// ============================================
// 📤 Export all controllers
// ============================================

export default {
  getWords,
  getWordById,
  searchWords,
  getCategories,
  saveWord,
  removeWord,
  getSavedWords,
  reviewWord,
};
