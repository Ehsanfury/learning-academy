/**
 * progressController.js
 * Path: backend/controllers/progressController.js
 * Description: Controller for user progress management
 * Changes:
 * - ✅ FIXED: getProgress now uses getAllProgress with proper params
 * - ✅ NEW: getDashboard for dashboard overview
 * - ✅ NEW: getWeeklyActivity for weekly activity chart
 * - ✅ Using asyncHandler to remove repetitive try/catch
 * - ✅ Integrated custom Error Classes
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
import { User } from "../models/index.js";

// ============================================
// 📊 Get all progress for a user
// GET /api/progress
// ============================================

export const getProgress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 50, offset = 0 } = req.query;

  logInfo("📊 [Controller] Getting all progress", { userId, limit, offset });

  const progress = await progressService.getAllProgress(userId, parseInt(limit), parseInt(offset));

  logInfo("✅ [Controller] Progress fetched successfully", {
    userId,
    count: progress.progress?.length || 0,
    total: progress.total || 0,
  });

  res.json({
    success: true,
    data: progress.progress || [],
    total: progress.total || 0,
    limit: progress.limit || parseInt(limit),
    offset: progress.offset || parseInt(offset),
  });
});

// ============================================
// 📊 Get progress statistics for a user
// GET /api/progress/stats
// ============================================

export const getStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  logInfo("📊 [Controller] Getting progress stats", { userId });

  const stats = await progressService.getUserProgressSummary(userId);

  logInfo("✅ [Controller] Stats fetched successfully", {
    userId,
    completedLessons: stats.completedLessons,
    completionRate: stats.completionRate,
  });

  res.json({
    success: true,
    data: stats,
  });
});

// ============================================
// 📝 Update progress for a lesson
// POST /api/progress
// ============================================

export const updateProgress = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  logInfo("📝 [Controller] Updating progress", {
    userId,
    body: req.body,
  });

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

// ============================================
// 📖 Get progress for a specific lesson
// GET /api/progress/lesson/:lessonId
// ============================================

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

// ============================================
// 📚 Get in-progress lessons for a user
// GET /api/progress/in-progress
// ============================================

export const getInProgressLessons = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 10 } = req.query;

  logInfo("📊 [Controller] Getting in-progress lessons", {
    userId,
    limit,
  });

  const result = await progressService.getAllProgress(userId, parseInt(limit), 0);

  const inProgress = (result.progress || []).filter((p) => p.status === "in_progress");

  logInfo("✅ [Controller] In-progress lessons fetched", {
    userId,
    count: inProgress.length,
  });

  res.json({
    success: true,
    data: inProgress,
    total: inProgress.length,
  });
});

// ============================================
// 📚 Get last completed lesson for a user
// GET /api/progress/last-completed
// ============================================

export const getLastCompletedLesson = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  logInfo("📊 [Controller] Getting last completed lesson", {
    userId,
  });

  const progress = await progressService.getUserProgressWithLessons(userId, 1, 0);

  const lastCompleted = (progress.progress || []).find(
    (p) => p.status === "completed" || p.status === "perfect"
  );

  logInfo("✅ [Controller] Last completed lesson fetched", {
    userId,
    found: !!lastCompleted,
  });

  res.json({
    success: true,
    data: lastCompleted || null,
  });
});

// ============================================
// 📚 Get completed lessons for a user
// GET /api/progress/completed
// ============================================

export const getCompletedLessons = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 20 } = req.query;

  logInfo("📊 [Controller] Getting completed lessons", {
    userId,
    limit,
  });

  const result = await progressService.getAllProgress(userId, parseInt(limit), 0);

  const completed = (result.progress || []).filter(
    (p) => p.status === "completed" || p.status === "perfect"
  );

  logInfo("✅ [Controller] Completed lessons fetched", {
    userId,
    count: completed.length,
  });

  res.json({
    success: true,
    data: completed,
    total: completed.length,
  });
});

// ============================================
// 📊 Get level distribution of completed lessons
// GET /api/progress/level-distribution
// ============================================

export const getLevelDistribution = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  logInfo("📊 [Controller] Getting level distribution", {
    userId,
  });

  const distribution = await progressService.getProgressByLevel(userId);

  logInfo("✅ [Controller] Level distribution fetched", {
    userId,
  });

  res.json({
    success: true,
    data: distribution,
  });
});

// ============================================
// 📊 Get daily statistics for a user
// GET /api/progress/daily-stats
// ============================================

export const getDailyStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { days = 7 } = req.query;

  logInfo("📊 [Controller] Getting daily stats", {
    userId,
    days,
  });

  const stats = await progressService.getDailyActivity(userId, parseInt(days, 10));

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

// ============================================
// ✅ NEW: Dashboard overview
// GET /api/progress/dashboard
// ============================================

export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  logInfo("📊 [Controller] Getting dashboard data", { userId });

  const stats = await progressService.getUserProgressSummary(userId);
  const dailyStats = await progressService.getDailyActivity(userId, 7);
  const user = await User.findByPk(userId);

  // Format weekly activity
  const weekDays = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
  const today = new Date();
  const todayDayIndex = today.getDay(); // 0=Sunday, 6=Saturday
  const weekStartIndex = (todayDayIndex + 1) % 7; // Saturday start

  const weeklyActivity = [];
  for (let i = 0; i < 7; i++) {
    const dayIndex = (weekStartIndex + i) % 7;
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split("T")[0];

    const match = dailyStats.find((d) => d.date === dateStr);
    weeklyActivity.push({
      day: weekDays[dayIndex] || "",
      xp: match ? parseInt(match.xp, 10) || 0 : 0,
      count: match ? parseInt(match.count, 10) || 0 : 0,
      date: dateStr,
    });
  }

  res.json({
    success: true,
    data: {
      totalLessons: stats.totalLessons || 0,
      completedLessons: stats.completedLessons || 0,
      totalXP: user?.xp || 0,
      weeklyActivity,
    },
  });
});

// ============================================
// ✅ NEW: Weekly activity
// GET /api/progress/weekly-activity
// ============================================

export const getWeeklyActivity = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { days = 7 } = req.query;

  logInfo("📊 [Controller] Getting weekly activity", { userId, days });

  const stats = await progressService.getDailyActivity(userId, parseInt(days, 10));

  const weekDays = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
  const today = new Date();
  const todayDayIndex = today.getDay();
  const weekStartIndex = (todayDayIndex + 1) % 7;

  const weeklyActivity = [];
  for (let i = 0; i < 7; i++) {
    const dayIndex = (weekStartIndex + i) % 7;
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split("T")[0];

    const match = stats.find((d) => d.date === dateStr);
    weeklyActivity.push({
      day: weekDays[dayIndex] || "",
      xp: match ? parseInt(match.xp, 10) || 0 : 0,
      count: match ? parseInt(match.count, 10) || 0 : 0,
      date: dateStr,
    });
  }

  res.json({
    success: true,
    data: weeklyActivity,
  });
});

// ============================================
// 📤 Export
// ============================================

export default {
  getProgress,
  getStats,
  updateProgress,
  getLessonProgress,
  getInProgressLessons,
  getLastCompletedLesson,
  getCompletedLessons,
  getLevelDistribution,
  getDailyStats,
  getDashboard,
  getWeeklyActivity,
};
