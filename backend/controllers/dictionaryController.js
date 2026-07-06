/**
 * dictionaryController.js
 * Path: backend/controllers/dictionaryController.js
 * Description: Dictionary and vocabulary management controller
 * Changes:
 * - ✅ FIXED: getDictionary returns all words
 * - ✅ FIXED: Proper response structure
 * - ✅ FIXED: Added getWord and removeWord exports
 */

import dictionaryService from "../services/dictionaryService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { ValidationError, NotFoundError } from "../errors/index.js";
import logger from "../config/logger.js";

/**
 * Get all dictionary words
 * GET /api/dictionary
 */
export const getDictionary = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { level, category, search, limit = 50, offset = 0 } = req.query;

  logger.info(`📚 Getting dictionary for user: ${userId || "guest"}`);

  const result = await dictionaryService.getAllWords({
    userId,
    level,
    category,
    search,
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.json({
    success: true,
    data: result.words || [],
    total: result.total || 0,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      total: result.total || 0,
    },
  });
});

/**
 * Get word by ID
 * GET /api/dictionary/word/:id
 * Alias: getWord
 */
export const getWordById = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!id) {
    throw new ValidationError({
      message: "Word ID is required",
      details: [{ field: "id", message: "Word ID is required" }],
    });
  }

  const word = await dictionaryService.getWordById(id, userId);

  if (!word) {
    throw new NotFoundError({
      message: `Word with id "${id}" not found`,
      resource: { model: "Vocabulary", id },
    });
  }

  res.json({
    success: true,
    data: word,
  });
});

// ✅ Alias for getWordById
export const getWord = getWordById;

/**
 * Search words
 * GET /api/dictionary/search
 */
export const searchWords = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { q, level, category, limit = 20, offset = 0 } = req.query;

  logger.info(`🔍 Searching dictionary: ${q}`);

  if (!q || q.length < 2) {
    throw new ValidationError({
      message: "Search query must be at least 2 characters",
      details: [{ field: "q", message: "Query is too short" }],
    });
  }

  const result = await dictionaryService.searchWords(q, {
    level,
    category,
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.json({
    success: true,
    data: {
      total: result.total || 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
      results: result.words || [],
    },
  });
});

/**
 * Get categories with counts
 * GET /api/dictionary/categories
 */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await dictionaryService.getCategories();

  res.json({
    success: true,
    data: categories,
  });
});

/**
 * Save word to user's saved list
 * POST /api/dictionary/saved-words
 */
export const saveWord = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { wordId } = req.body;

  if (!userId) {
    throw new ValidationError({
      message: "User not authenticated",
      details: [{ field: "userId", message: "User ID is required" }],
    });
  }

  if (!wordId) {
    throw new ValidationError({
      message: "Word ID is required",
      details: [{ field: "wordId", message: "Word ID is required" }],
    });
  }

  const result = await dictionaryService.saveWord(userId, wordId);

  res.json({
    success: true,
    data: result,
    message: "Word saved successfully",
  });
});

/**
 * Remove saved word
 * DELETE /api/dictionary/saved-words/:id
 * Alias: removeWord
 */
export const removeSavedWord = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    throw new ValidationError({
      message: "User not authenticated",
      details: [{ field: "userId", message: "User ID is required" }],
    });
  }

  if (!id) {
    throw new ValidationError({
      message: "Word ID is required",
      details: [{ field: "id", message: "Word ID is required" }],
    });
  }

  await dictionaryService.removeSavedWord(userId, id);

  res.json({
    success: true,
    message: "Word removed from saved list",
  });
});

// ✅ Alias for removeSavedWord
export const removeWord = removeSavedWord;

/**
 * Get saved words for user
 * GET /api/dictionary/saved-words
 */
export const getSavedWords = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ValidationError({
      message: "User not authenticated",
      details: [{ field: "userId", message: "User ID is required" }],
    });
  }

  const words = await dictionaryService.getSavedWords(userId);

  res.json({
    success: true,
    data: words || [],
  });
});
