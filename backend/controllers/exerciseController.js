/**
 * exerciseController.js
 * Path: backend/controllers/exerciseController.js
 * Description: Exercise management controller
 * Changes:
 * - ✅ FIXED: generateExercise now works without lessonId (generates sample exercises)
 * - ✅ FIXED: getExercisesByLesson properly returns exercises
 */

import exerciseService from "../services/exerciseService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { ValidationError } from "../errors/index.js";
import logger from "../config/logger.js";

/**
 * Get exercises by lesson ID
 * GET /api/exercises/lesson/:lessonId
 */
export const getExercisesByLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const userId = req.user?.id;

  if (!lessonId) {
    throw new ValidationError({
      message: "Lesson ID is required",
      details: [{ field: "lessonId", message: "Lesson ID is required" }],
    });
  }

  logger.info(`📚 Getting exercises for lesson: ${lessonId}`);

  const result = await exerciseService.getExercisesByLesson(lessonId, userId);

  res.json({
    success: true,
    data: result.exercises || [],
    total: result.total || 0,
    source: result.source || "lesson_sections",
  });
});

/**
 * Generate exercise from lesson OR generate sample exercises
 * POST /api/exercises/generate
 * ✅ FIXED: Now works without lessonId
 */
export const generateExercise = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { lessonId, type = "mixed", level = "A1", count = 5 } = req.body;

  logger.info(`📝 Generating exercise for user ${userId}`, { lessonId, type, level, count });

  let questions = [];

  // اگر lessonId وجود دارد، از درس استخراج کن
  if (lessonId) {
    const result = await exerciseService.getExercisesByLesson(lessonId, userId);
    if (result.exercises && result.exercises.length > 0) {
      // تمام سوالات را از همه تمرین‌ها جمع کن
      result.exercises.forEach((exercise) => {
        if (exercise.questions && Array.isArray(exercise.questions)) {
          questions = [...questions, ...exercise.questions];
        }
      });
    }
  }

  // اگر سوالی پیدا نشد، نمونه‌های آموزشی تولید کن
  if (questions.length === 0) {
    questions = generateSampleQuestions(type, level, count);
  }

  // محدود کردن تعداد سوالات
  if (questions.length > count) {
    questions = questions.slice(0, count);
  }

  const exercise = {
    id: `exercise-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type: type || "mixed",
    level: level || "A1",
    questions: questions,
    totalQuestions: questions.length,
    xpReward: Math.round((questions.length / 10) * 50) || 25,
    source: lessonId ? "lesson" : "sample",
  };

  res.json({
    success: true,
    data: exercise,
  });
});

/**
 * Generate sample questions for practice
 */
function generateSampleQuestions(type, level, count) {
  const samples = {
    vocabulary: [
      {
        id: `voc-${Date.now()}-1`,
        type: "multiple_choice",
        question: { fa: "معنی کلمه 'Hallo' چیست؟", en: "What does 'Hallo' mean?" },
        options: ["سلام", "خداحافظ", "متشکرم", "خواهش می‌کنم"],
        correct: 0,
      },
      {
        id: `voc-${Date.now()}-2`,
        type: "multiple_choice",
        question: { fa: "معنی کلمه 'Tschüss' چیست؟", en: "What does 'Tschüss' mean?" },
        options: ["سلام", "خداحافظ", "متشکرم", "خواهش می‌کنم"],
        correct: 1,
      },
      {
        id: `voc-${Date.now()}-3`,
        type: "multiple_choice",
        question: { fa: "معنی کلمه 'Danke' چیست؟", en: "What does 'Danke' mean?" },
        options: ["سلام", "خداحافظ", "متشکرم", "خواهش می‌کنم"],
        correct: 2,
      },
      {
        id: `voc-${Date.now()}-4`,
        type: "multiple_choice",
        question: { fa: "معنی کلمه 'Bitte' چیست؟", en: "What does 'Bitte' mean?" },
        options: ["سلام", "خداحافظ", "متشکرم", "خواهش می‌کنم"],
        correct: 3,
      },
    ],
    grammar: [
      {
        id: `gram-${Date.now()}-1`,
        type: "multiple_choice",
        question: {
          fa: "حرف تعریف مناسب برای 'Mann' چیست؟",
          en: "What is the article for 'Mann'?",
        },
        options: ["der", "die", "das", "den"],
        correct: 0,
      },
      {
        id: `gram-${Date.now()}-2`,
        type: "multiple_choice",
        question: {
          fa: "حرف تعریف مناسب برای 'Frau' چیست؟",
          en: "What is the article for 'Frau'?",
        },
        options: ["der", "die", "das", "den"],
        correct: 1,
      },
      {
        id: `gram-${Date.now()}-3`,
        type: "multiple_choice",
        question: {
          fa: "حرف تعریف مناسب برای 'Kind' چیست؟",
          en: "What is the article for 'Kind'?",
        },
        options: ["der", "die", "das", "den"],
        correct: 2,
      },
    ],
    listening: [
      {
        id: `list-${Date.now()}-1`,
        type: "multiple_choice",
        question: { fa: "در مکالمه چه گفته شد؟", en: "What was said in the conversation?" },
        options: ["Hallo", "Tschüss", "Danke", "Bitte"],
        correct: 0,
      },
    ],
    reading: [
      {
        id: `read-${Date.now()}-1`,
        type: "multiple_choice",
        question: { fa: "متن درباره چیست؟", en: "What is the text about?" },
        options: ["سلام و احوالپرسی", "خرید", "سفر", "غذا"],
        correct: 0,
      },
    ],
    writing: [
      {
        id: `write-${Date.now()}-1`,
        type: "fill_in",
        question: { fa: "جمله را کامل کنید: Ich ___ Nina.", en: "Complete: Ich ___ Nina." },
        options: ["heiße", "heißt", "heißen", "heiß"],
        correct: 0,
      },
    ],
    mixed: [
      {
        id: `mix-${Date.now()}-1`,
        type: "multiple_choice",
        question: { fa: "معنی کلمه 'Danke' چیست؟", en: "What does 'Danke' mean?" },
        options: ["سلام", "خداحافظ", "متشکرم", "خواهش می‌کنم"],
        correct: 2,
      },
      {
        id: `mix-${Date.now()}-2`,
        type: "multiple_choice",
        question: {
          fa: "حرف تعریف مناسب برای 'Kind' چیست؟",
          en: "What is the article for 'Kind'?",
        },
        options: ["der", "die", "das", "den"],
        correct: 2,
      },
      {
        id: `mix-${Date.now()}-3`,
        type: "fill_in",
        question: { fa: "جمله را کامل کنید: Ich ___ Nina.", en: "Complete: Ich ___ Nina." },
        options: ["heiße", "heißt", "heißen", "heiß"],
        correct: 0,
      },
    ],
  };

  const sampleQuestions = samples[type] || samples.mixed;

  // اگر تعداد درخواستی بیشتر از نمونه‌هاست، تکرار کن
  let result = [];
  while (result.length < count) {
    result = [...result, ...sampleQuestions];
  }

  return result.slice(0, count);
}

/**
 * Submit exercise answers
 * POST /api/exercises/submit
 */
export const submitExercise = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { exerciseId, answers, timeSpent = 0 } = req.body;

  if (!userId) {
    throw new ValidationError({
      message: "User not authenticated",
      details: [{ field: "userId", message: "User ID is required" }],
    });
  }

  if (!exerciseId) {
    throw new ValidationError({
      message: "Exercise ID is required",
      details: [{ field: "exerciseId", message: "Exercise ID is required" }],
    });
  }

  if (!answers || typeof answers !== "object") {
    throw new ValidationError({
      message: "Answers are required",
      details: [{ field: "answers", message: "Answers must be provided" }],
    });
  }

  const result = await exerciseService.submitExercise(userId, exerciseId, answers, timeSpent);

  logger.info(`Exercise ${exerciseId} submitted by user ${userId} with score ${result.score}`);

  res.json({
    success: true,
    message: result.passed ? "تمرین با موفقیت کامل شد!" : "تمرین کامل شد، اما نیاز به مرور دارد.",
    data: result,
  });
});

/**
 * Get exercise history
 * GET /api/exercises/history
 */
export const getExerciseHistory = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { limit = 20 } = req.query;

  if (!userId) {
    throw new ValidationError({
      message: "User not authenticated",
      details: [{ field: "userId", message: "User ID is required" }],
    });
  }

  const history = await exerciseService.getUserExerciseHistory(userId, parseInt(limit));

  res.json({
    success: true,
    data: history,
    total: history.length,
  });
});

/**
 * Get exercise stats
 * GET /api/exercises/stats
 */
export const getExerciseStats = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ValidationError({
      message: "User not authenticated",
      details: [{ field: "userId", message: "User ID is required" }],
    });
  }

  const stats = await exerciseService.getExerciseStats(userId);

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * Get exercise types
 * GET /api/exercises/types
 */
export const getExerciseTypes = asyncHandler(async (req, res) => {
  const types = [
    { id: "vocabulary", name: "واژگان", icon: "📚" },
    { id: "grammar", name: "گرامر", icon: "📝" },
    { id: "reading", name: "خواندن", icon: "📖" },
    { id: "listening", name: "شنیداری", icon: "🎧" },
    { id: "writing", name: "نوشتاری", icon: "✍️" },
    { id: "mixed", name: "ترکیبی", icon: "🎯" },
  ];

  res.json({
    success: true,
    data: types,
  });
});

/**
 * Get difficulty levels
 * GET /api/exercises/levels
 */
export const getDifficultyLevels = asyncHandler(async (req, res) => {
  const levels = [
    { id: "A1", name: "A1 - مبتدی" },
    { id: "A2", name: "A2 - مقدماتی" },
    { id: "B1", name: "B1 - متوسط" },
    { id: "B2", name: "B2 - متوسط پیشرفته" },
    { id: "C1", name: "C1 - پیشرفته" },
    { id: "C2", name: "C2 - تسلط" },
  ];

  res.json({
    success: true,
    data: levels,
  });
});
