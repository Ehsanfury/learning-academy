/**
 * userController.js
 * Path: backend/controllers/userController.js
 * Description: User management controller
 */

import userService from "../services/userService.js";
import achievementService from "../services/achievementService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { validateUpdateProfile } from "../validators/user.validator.js";
import { NotFoundError, ValidationError, UnauthorizedError } from "../errors/index.js";
import logger from "../config/logger.js";

// ============================================
// 📝 Controllers
// ============================================

export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const profile = await userService.getProfile(userId);

  res.json({
    success: true,
    data: profile,
  });
});

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

export const getStreak = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const user = await userService.getProfile(userId);

  res.json({
    success: true,
    data: {
      streak: user.streak || 0,
      longestStreak: user.longestStreak || 0,
      lastActiveDate: user.lastActiveDate,
    },
  });
});

export const getAchievements = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const achievements = await achievementService.getUserAchievements(userId);

  res.json({
    success: true,
    data: achievements,
  });
});

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

export const getLeaderboard = asyncHandler(async (req, res) => {
  const { period = "all-time", limit = 10 } = req.query;

  const safeLimit = Math.min(parseInt(limit) || 10, 100);

  const leaderboard = await userService.getLeaderboard({ period, limit: safeLimit });

  res.json({
    success: true,
    data: leaderboard,
  });
});

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

export const getSettings = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const user = await userService.getProfile(userId);

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

export const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { password } = req.body;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  if (!password) {
    throw new ValidationError({
      message: "Password is required to delete account",
      details: [{ field: "password", message: "Password is required" }],
    });
  }

  await userService.deleteAccount(userId, password);

  logger.info(`User account deleted: ${userId}`);

  res.json({
    success: true,
    message: "Account deleted successfully",
  });
});
