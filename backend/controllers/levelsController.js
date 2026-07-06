/**
 * levelsController.js
 * Path: backend/controllers/levelsController.js
 * Description: Levels management controller
 * Changes:
 * - ✅ M12: Implemented real level progress tracking
 * - ✅ Using asyncHandler for consistency
 * - ✅ Added proper error handling
 */

import { logInfo, logError } from "../config/logger.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { Lesson, LessonProgress } from "../models/index.js";
import { Op } from "sequelize";
import { ValidationError, NotFoundError } from "../errors/index.js";

// ============================================
// 📊 Level Data
// ============================================

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const LEVEL_CONFIG = {
  A1: {
    id: "A1",
    order: 1,
    label: { fa: "مبتدی", en: "Beginner", de: "Anfänger" },
    description: {
      fa: "شروع یادگیری زبان آلمانی از صفر",
      en: "Start learning German from zero",
      de: "Deutsch lernen von Null an",
    },
    color: "#22c55e",
    icon: "🌱",
    badgeIcon: "🥉",
  },
  A2: {
    id: "A2",
    order: 2,
    label: { fa: "مقدماتی", en: "Elementary", de: "Grundlegend" },
    description: {
      fa: "تکمیل مبانی و شروع مکالمات ساده",
      en: "Complete basics and start simple conversations",
      de: "Grundlagen vervollständigen und einfache Gespräche beginnen",
    },
    color: "#3b82f6",
    icon: "📘",
    badgeIcon: "🥈",
  },
  B1: {
    id: "B1",
    order: 3,
    label: { fa: "متوسط", en: "Intermediate", de: "Mittelstufe" },
    description: {
      fa: "صحبت درباره موضوعات روزمره و شخصی",
      en: "Talk about everyday and personal topics",
      de: "Über alltägliche und persönliche Themen sprechen",
    },
    color: "#f59e0b",
    icon: "📗",
    badgeIcon: "🥇",
  },
  B2: {
    id: "B2",
    order: 4,
    label: { fa: "متوسط پیشرفته", en: "Upper Intermediate", de: "Obere Mittelstufe" },
    description: {
      fa: "مکالمات پیچیده و درک متون تخصصی",
      en: "Complex conversations and understanding specialized texts",
      de: "Komplexe Gespräche und Verstehen von Fachtexten",
    },
    color: "#f97316",
    icon: "📙",
    badgeIcon: "🏆",
  },
  C1: {
    id: "C1",
    order: 5,
    label: { fa: "پیشرفته", en: "Advanced", de: "Fortgeschritten" },
    description: {
      fa: "تسلط بر زبان برای اهداف حرفه‌ای و آکادمیک",
      en: "Mastery of language for professional and academic purposes",
      de: "Beherrschung der Sprache für berufliche und akademische Zwecke",
    },
    color: "#ef4444",
    icon: "📕",
    badgeIcon: "👑",
  },
  C2: {
    id: "C2",
    order: 6,
    label: { fa: "تسلط", en: "Mastery", de: "Perfektion" },
    description: {
      fa: "تسلط کامل بر زبان در تمام موقعیت‌ها",
      en: "Complete mastery of the language in all situations",
      de: "Vollständige Beherrschung der Sprache in allen Situationen",
    },
    color: "#a855f7",
    icon: "👑",
    badgeIcon: "💎",
  },
};

// ============================================
// 📤 Controllers
// ============================================

/**
 * Get all levels
 * GET /api/levels
 */
export const getLevels = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  logInfo("📊 [Levels] Getting all levels", { userId });

  const levels = LEVELS.map((levelId) => ({
    ...LEVEL_CONFIG[levelId],
  }));

  res.json({
    success: true,
    data: levels,
    count: levels.length,
  });
});

/**
 * Get a specific level
 * GET /api/levels/:levelId
 */
export const getLevel = asyncHandler(async (req, res) => {
  const { levelId } = req.params;
  const userId = req.user?.id;

  logInfo("📊 [Levels] Getting level", { userId, levelId });

  const normalizedLevel = levelId.toUpperCase();
  const level = LEVEL_CONFIG[normalizedLevel];
  if (!level) {
    throw new NotFoundError({
      message: `Level ${levelId} not found`,
      resource: { model: "Level", id: levelId },
    });
  }

  res.json({
    success: true,
    data: level,
  });
});

/**
 * ✅ M12: Get level progress for user - Real implementation
 * GET /api/levels/:levelId/progress
 */
export const getLevelProgress = asyncHandler(async (req, res) => {
  const { levelId } = req.params;
  const userId = req.user?.id;

  logInfo("📊 [Levels] Getting level progress", { userId, levelId });

  if (!userId) {
    throw new UnauthorizedError("Authentication required");
  }

  const normalizedLevel = levelId.toUpperCase();
  const level = LEVEL_CONFIG[normalizedLevel];
  if (!level) {
    throw new NotFoundError({
      message: `Level ${levelId} not found`,
      resource: { model: "Level", id: levelId },
    });
  }

  // Get all lessons for this level
  const lessons = await Lesson.findAll({
    where: {
      level: normalizedLevel,
      isActive: true,
    },
    order: [
      ["unit", "ASC"],
      ["lessonNumber", "ASC"],
    ],
  });

  if (lessons.length === 0) {
    return res.json({
      success: true,
      data: {
        level: normalizedLevel,
        totalLessons: 0,
        completedLessons: 0,
        perfectLessons: 0,
        progressPercentage: 0,
        lessons: [],
      },
    });
  }

  const lessonIds = lessons.map((l) => l.id);

  // Get progress for all lessons in this level
  const progress = await LessonProgress.findAll({
    where: {
      userId,
      lessonId: {
        [Op.in]: lessonIds,
      },
    },
  });

  const progressMap = {};
  progress.forEach((p) => {
    progressMap[p.lessonId] = p;
  });

  let completedCount = 0;
  let perfectCount = 0;

  // Build lesson progress details
  const lessonProgress = lessons.map((lesson) => {
    const prog = progressMap[lesson.id];
    const isCompleted = prog && (prog.status === "completed" || prog.status === "perfect");
    const isPerfect = prog && prog.status === "perfect";

    if (isCompleted) completedCount++;
    if (isPerfect) perfectCount++;

    return {
      lessonId: lesson.id,
      title: lesson.title,
      unit: lesson.unit,
      lessonNumber: lesson.lessonNumber,
      status: prog?.status || "not_started",
      score: prog?.score || 0,
      xpEarned: prog?.xpEarned || 0,
      completedAt: prog?.completedAt || null,
      isCompleted,
      isPerfect,
    };
  });

  const totalLessons = lessons.length;
  const progressPercentage =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Get level XP from completed lessons
  const totalXp = progress.reduce((sum, p) => sum + (p.xpEarned || 0), 0);

  res.json({
    success: true,
    data: {
      level: normalizedLevel,
      levelInfo: level,
      totalLessons,
      completedLessons: completedCount,
      perfectLessons: perfectCount,
      progressPercentage,
      totalXp,
      lessons: lessonProgress,
      stats: {
        completed: completedCount,
        remaining: totalLessons - completedCount,
        inProgress: progress.filter((p) => p.status === "in_progress").length,
        notStarted: totalLessons - progress.length,
      },
    },
  });
});

export default {
  getLevels,
  getLevel,
  getLevelProgress,
};
