/**
 * levelsController.js
 * Path: backend/controllers/levelsController.js
 * Description: Levels management controller
 * Changes:
 * - ✅ FIXED: Added missing UnauthorizedError import
 */

import levelService from "../services/levelService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { ValidationError, NotFoundError, UnauthorizedError } from "../errors/index.js";
import logger from "../config/logger.js";

// ============================================
// 📝 Controllers
// ============================================

/**
 * Get all levels
 * GET /api/levels
 */
export const getLevels = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { level } = req.query;

  const levels = await levelService.getLevels({ userId, level });

  res.json({
    success: true,
    data: levels,
  });
});

/**
 * Get level by ID
 * GET /api/levels/:id
 */
export const getLevelById = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!id) {
    throw new ValidationError({
      message: "Level ID is required",
      details: [{ field: "id", message: "Level ID is required" }],
    });
  }

  const level = await levelService.getLevelById(id, userId);

  if (!level) {
    throw new NotFoundError({
      message: `Level with id "${id}" not found`,
      resource: { model: "Level", id },
    });
  }

  res.json({
    success: true,
    data: level,
  });
});

/**
 * Get level progress
 * GET /api/levels/:id/progress
 */
export const getLevelProgress = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const progress = await levelService.getLevelProgress(userId, id);

  res.json({
    success: true,
    data: progress,
  });
});

/**
 * Get level stats
 * GET /api/levels/stats
 */
export const getLevelStats = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const stats = await levelService.getUserLevelStats(userId);

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * Get level suggestions
 * GET /api/levels/suggestions
 */
export const getSuggestions = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { count = 3 } = req.query;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const suggestions = await levelService.getSuggestions(userId, parseInt(count));

  res.json({
    success: true,
    data: suggestions,
  });
});

/**
 * Check level lock status
 * GET /api/levels/:id/lock
 */
export const checkLevelLock = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const lockStatus = await levelService.checkLevelLock(userId, id);

  res.json({
    success: true,
    data: lockStatus,
  });
});

/**
 * Reset level progress (admin only)
 * POST /api/levels/:id/reset
 */
export const resetLevelProgress = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  if (req.user?.role !== "admin") {
    throw new UnauthorizedError("Admin access required");
  }

  await levelService.resetLevelProgress(userId, id);

  logger.info(`Level ${id} progress reset for user ${userId}`);

  res.json({
    success: true,
    message: "Level progress reset successfully",
  });
});

/**
 * Get level recommendations
 * GET /api/levels/recommendations
 */
export const getRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const recommendations = await levelService.getRecommendations(userId);

  res.json({
    success: true,
    data: recommendations,
  });
});

export default {
  getLevels,
  getLevelById,
  getLevelProgress,
  getLevelStats,
  getSuggestions,
  checkLevelLock,
  resetLevelProgress,
  getRecommendations,
};
