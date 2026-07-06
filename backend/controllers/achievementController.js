/**
 * achievementController.js
 * Learning Academy
 * Achievements controller
 * Changes:
 * - ✅ FIXED H15: Removed manual check endpoint (XP farming)
 * - ✅ Achievements are now checked automatically
 * - ✅ All endpoints use asyncHandler for consistency
 * - ✅ Added proper error handling
 * - ✅ Using achievementService for all operations
 */

import achievementService from "../services/achievementService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { logInfo, logError, logWarn } from "../config/logger.js";
import { ValidationError } from "../errors/index.js";

/**
 * Get all achievements with status for user
 * GET /api/achievements
 */
export const getAllAchievements = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  logInfo("🏆 [Achievement] Getting all achievements with status", { userId });

  const achievements = await achievementService.getAllAchievementsWithStatus(userId);

  res.json({
    success: true,
    data: achievements,
    count: achievements.length,
  });
});

/**
 * Get user earned achievements
 * GET /api/achievements/my
 */
export const getUserAchievements = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  logInfo("🏆 [Achievement] Getting user achievements", { userId });

  const achievements = await achievementService.getUserAchievements(userId);

  res.json({
    success: true,
    data: achievements,
    count: achievements.length,
  });
});

/**
 * Get unviewed achievements
 * GET /api/achievements/unviewed
 */
export const getUnviewedAchievements = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  logInfo("🏆 [Achievement] Getting unviewed achievements", { userId });

  const achievements = await achievementService.getUnviewedAchievements(userId);

  res.json({
    success: true,
    data: achievements,
    count: achievements.length,
  });
});

/**
 * Mark achievement as viewed
 * PUT /api/achievements/:achievementId/view
 */
export const markAchievementAsViewed = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { achievementId } = req.params;

  logInfo("👁️ [Achievement] Marking achievement as viewed", {
    userId,
    achievementId,
  });

  if (!achievementId) {
    throw new ValidationError({
      message: "Achievement ID is required",
      details: [{ field: "achievementId", message: "Achievement ID is required" }],
    });
  }

  await achievementService.markAsViewed(userId, achievementId);

  res.json({
    success: true,
    message: "Achievement marked as viewed",
  });
});

/**
 * Get user achievement statistics
 * GET /api/achievements/stats
 */
export const getAchievementStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  logInfo("📊 [Achievement] Getting achievement stats", { userId });

  const stats = await achievementService.getAchievementStats(userId);

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * ❌ REMOVED: checkAchievements endpoint
 * ✅ FIXED H15: This endpoint was removed because it allowed users to
 * trigger achievements on demand and XP farm.
 *
 * Achievements are checked automatically in the background.
 * To check achievements, use the service:
 * await achievementService.checkAndAwardAchievements(userId);
 */

// ============================================
// 📤 Export all controllers
// ============================================

export default {
  getAllAchievements,
  getUserAchievements,
  getUnviewedAchievements,
  markAchievementAsViewed,
  getAchievementStats,
  // checkAchievements, // ❌ REMOVED - XP farming prevention
};
