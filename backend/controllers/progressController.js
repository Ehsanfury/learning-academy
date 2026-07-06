/**
 * progressController.js
 * Path: backend/controllers/progressController.js
 * Description: Controller for user progress management
 * Changes:
 * - ✅ Using asyncHandler to remove repetitive try/catch
 * - ✅ Integrated custom Error Classes
 * - ✅ Cleaner error handling
 * - ✅ Removed manual error message checking
 * - ✅ Added logging for all operations
 */

import progressService from "../services/progressService.js";
import { logInfo, logError, logWarn } from "../config/logger.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import {
  validateUserId,
  validateLessonId,
  validateUpdateProgress,
} from "../validators/progress.validator.js";
import { ValidationError } from "../errors/index.js";

/**
 * Get all progress for a user
 * GET /api/progress
 */
export const getProgress = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  logInfo("📊 [Controller] Getting all progress", { userId });

  const progress = await progressService.getAllProgress(userId);

  logInfo("✅ [Controller] Progress fetched successfully", {
    userId,
    count: progress.length,
  });

  res.json({
    success: true,
    data: progress,
  });
});

/**
 * Get progress statistics for a user
 * GET /api/progress/stats
 */
export const getStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  logInfo("📊 [Controller] Getting progress stats", { userId });

  const stats = await progressService.getStats(userId);

  logInfo("✅ [Controller] Stats fetched successfully", {
    userId,
    completedLessons: stats.completedLessons,
    progressPercentage: stats.progressPercentage,
  });

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * Update progress for a lesson
 * POST /api/progress
 */
export const updateProgress = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  logInfo("📝 [Controller] Updating progress", {
    userId,
    body: req.body,
  });

  // Validate input
  const validation = validateUpdateProgress(req.body);
  if (!validation.valid) {
    throw new ValidationError({
      message: validation.message,
      details: validation.errors,
    });
  }

  const progress = await progressService.updateProgress(userId, validation.data);

  logInfo("✅ [Controller] Progress updated successfully", {
    userId,
    lessonId: validation.data.lessonId,
    status: validation.data.status,
  });

  res.json({
    success: true,
    message: "Progress updated successfully",
    data: progress,
  });
});

/**
 * Get progress for a specific lesson
 * GET /api/progress/lesson/:lessonId
 */
export const getLessonProgress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { lessonId } = req.params;

  logInfo("📊 [Controller] Getting lesson progress", {
    userId,
    lessonId,
  });

  const validation = validateLessonId(lessonId);
  if (!validation.valid) {
    throw new ValidationError({
      message: validation.message,
      details: validation.errors,
    });
  }

  const progress = await progressService.getLessonProgress(userId, lessonId);

  logInfo("✅ [Controller] Lesson progress fetched", {
    userId,
    lessonId,
    status: progress.status,
  });

  res.json({
    success: true,
    data: progress,
  });
});

/**
 * Get in-progress lessons for a user
 * GET /api/progress/in-progress
 */
export const getInProgressLessons = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 10 } = req.query;

  logInfo("📊 [Controller] Getting in-progress lessons", {
    userId,
    limit,
  });

  const progress = await progressService.getInProgressLessons(userId, parseInt(limit, 10));

  logInfo("✅ [Controller] In-progress lessons fetched", {
    userId,
    count: progress.length,
  });

  res.json({
    success: true,
    data: progress,
  });
});

/**
 * Get last completed lesson for a user
 * GET /api/progress/last-completed
 */
export const getLastCompletedLesson = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  logInfo("📊 [Controller] Getting last completed lesson", {
    userId,
  });

  const progress = await progressService.getLastCompletedLesson(userId);

  logInfo("✅ [Controller] Last completed lesson fetched", {
    userId,
    found: !!progress,
  });

  res.json({
    success: true,
    data: progress,
  });
});

/**
 * Get completed lessons for a user
 * GET /api/progress/completed
 */
export const getCompletedLessons = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 20 } = req.query;

  logInfo("📊 [Controller] Getting completed lessons", {
    userId,
    limit,
  });

  const progress = await progressService.getCompletedLessons(userId, parseInt(limit, 10));

  logInfo("✅ [Controller] Completed lessons fetched", {
    userId,
    count: progress.length,
  });

  res.json({
    success: true,
    data: progress,
  });
});

/**
 * Get level distribution of completed lessons
 * GET /api/progress/level-distribution
 */
export const getLevelDistribution = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  logInfo("📊 [Controller] Getting level distribution", {
    userId,
  });

  const distribution = await progressService.getLevelDistribution(userId);

  logInfo("✅ [Controller] Level distribution fetched", {
    userId,
  });

  res.json({
    success: true,
    data: distribution,
  });
});

/**
 * Get daily statistics for a user
 * GET /api/progress/daily-stats
 */
export const getDailyStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { days = 7 } = req.query;

  logInfo("📊 [Controller] Getting daily stats", {
    userId,
    days,
  });

  const stats = await progressService.getDailyStats(userId, parseInt(days, 10));

  logInfo("✅ [Controller] Daily stats fetched", {
    userId,
    days,
    count: stats.length,
  });

  res.json({
    success: true,
    data: stats,
  });
});
