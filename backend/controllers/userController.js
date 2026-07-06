/**
 * userController.js
 * Path: backend/controllers/userController.js
 * Description: User management controller
 * Changes:
 * - ✅ Added getSettings and updateSettings
 * - ✅ Using userService for all user operations
 * - ✅ Proper error handling
 * - ✅ Input validation
 * - ✅ Proper response structure
 */

import userService from "../services/userService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { validateUpdateProfile } from "../validators/user.validator.js";
import { NotFoundError, ValidationError, UnauthorizedError } from "../errors/index.js";
import logger from "../config/logger.js";

// ============================================
// 📝 Controllers
// ============================================

/**
 * Get user profile
 * GET /api/users/profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const profile = await userService.getUserProfile(userId);

  res.json({
    success: true,
    data: profile,
  });
});

/**
 * Update user profile
 * PUT /api/users/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const validatedData = validateUpdateProfile(req.body);

  const updatedUser = await userService.updateProfile(userId, validatedData);

  logger.info(`Profile updated for user: ${userId}`);

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});

/**
 * Get user stats
 * GET /api/users/stats
 */
export const getStats = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const stats = await userService.getUserStats(userId);

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * Get user streak
 * GET /api/users/streak
 */
export const getStreak = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const user = await userService.getUserProfile(userId);

  res.json({
    success: true,
    data: {
      streak: user.streak || 0,
      longestStreak: user.longestStreak || 0,
      lastActiveDate: user.lastActiveDate,
    },
  });
});

/**
 * Get user achievements
 * GET /api/users/achievements
 */
export const getAchievements = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const achievements = await userService.getUserAchievements(userId);

  res.json({
    success: true,
    data: achievements,
  });
});

/**
 * Get user recent activity
 * GET /api/users/activity
 */
export const getRecentActivity = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const limit = parseInt(req.query.limit) || 10;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const activities = await userService.getRecentActivity(userId, limit);

  res.json({
    success: true,
    data: activities,
  });
});

/**
 * Get leaderboard
 * GET /api/users/leaderboard
 */
export const getLeaderboard = asyncHandler(async (req, res) => {
  const { type = "xp", limit = 10, page = 1 } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const safeLimit = Math.min(parseInt(limit), 100);

  const leaderboard = await userService.getLeaderboard(type, safeLimit, offset);

  res.json({
    success: true,
    data: leaderboard,
  });
});

/**
 * Get user rank
 * GET /api/users/rank
 */
export const getUserRank = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { type = "xp" } = req.query;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const rank = await userService.getUserRank(userId, type);

  res.json({
    success: true,
    data: { rank },
  });
});

/**
 * Search users
 * GET /api/users/search
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q || q.length < 2) {
    throw new ValidationError({
      message: "Search query must be at least 2 characters",
      details: [{ field: "q", message: "Query is too short" }],
    });
  }

  const users = await userService.searchUsers(q, parseInt(limit));

  res.json({
    success: true,
    data: users,
  });
});

/**
 * ✅ FIXED: Get user settings
 * GET /api/users/settings
 */
export const getSettings = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const user = await userService.getUserProfile(userId);

  const settings = {
    language: user.language || "fa",
    theme: user.theme || "light",
    nativeLanguage: user.nativeLanguage || "fa",
    learningGoal: user.learningGoal || "general",
    dailyGoal: user.dailyGoal || 50,
    notifications: user.notifications !== false,
    soundEnabled: user.soundEnabled !== false,
    streakReminder: user.streakReminder !== false,
    autoPlayAudio: user.autoPlayAudio !== false,
  };

  res.json({
    success: true,
    data: settings,
  });
});

/**
 * ✅ FIXED: Update user settings
 * PUT /api/users/settings
 */
export const updateSettings = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const allowedFields = [
    "language",
    "theme",
    "nativeLanguage",
    "learningGoal",
    "dailyGoal",
    "notifications",
    "soundEnabled",
    "streakReminder",
    "autoPlayAudio",
  ];

  const updateData = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  const updatedUser = await userService.updateProfile(userId, updateData);

  logger.info(`Settings updated for user: ${userId}`);

  res.json({
    success: true,
    message: "Settings updated successfully",
    data: updatedUser,
  });
});

/**
 * Delete user account
 * DELETE /api/users/account
 */
export const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  await userService.deleteUser(userId);

  logger.info(`User account deleted: ${userId}`);

  res.json({
    success: true,
    message: "Account deleted successfully",
  });
});
