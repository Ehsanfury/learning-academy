/**
 * storiesController.js
 * Path: backend/controllers/storiesController.js
 * Description: Stories management controller
 * Version: 4.0 - Using storyService
 * Changes:
 * - ✅ Using storyService for all operations
 * - ✅ Proper error handling
 * - ✅ Mock data fallback
 */

import storyService from "../services/storyService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { NotFoundError, ValidationError, UnauthorizedError } from "../errors/index.js";
import logger from "../config/logger.js";

// ============================================
// 📊 Mock Stories Data (Fallback)
// ============================================

const MOCK_STORIES = [
  {
    id: "story-1",
    level: "A1",
    title: { fa: "داستان کوتاه آلمانی", en: "Short German Story", de: "Kurze Deutsche Geschichte" },
    description: {
      fa: "یک داستان کوتاه و جذاب برای شروع",
      en: "A short and interesting story to start",
      de: "Eine kurze und interessante Geschichte für den Anfang",
    },
    icon: "📖",
    xpReward: 30,
    estimatedMinutes: 5,
    paragraphs: [
      {
        de: "Hallo! Ich heiße Anna.",
        fa: "سلام! اسم من آنا است.",
        vocabulary: [{ de: "heißen", fa: "نام داشتن" }],
      },
      {
        de: "Ich komme aus Deutschland.",
        fa: "من از آلمان هستم.",
        vocabulary: [{ de: "kommen aus", fa: "آمدن از" }],
      },
    ],
    quiz: [
      {
        id: "q1",
        question: "اسم شخص چیست؟",
        options: ["Anna", "Maria", "Lisa", "Sarah"],
        correct: "Anna",
      },
    ],
  },
];

// ============================================
// 📤 Controllers
// ============================================

/**
 * Get all stories
 * GET /api/stories
 */
export const getStories = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { level, limit = 20, offset = 0 } = req.query;

  logger.info(`📚 Getting stories for user: ${userId || "guest"}`);

  try {
    const result = await storyService.getStories(userId, { level, limit, offset });

    // If no stories in database, return mock data
    if (result.stories.length === 0) {
      logger.info(`ℹ️ No stories in database, returning mock data`);

      let mockData = MOCK_STORIES;
      if (level) {
        mockData = mockData.filter((s) => s.level === level.toUpperCase());
      }

      return res.json({
        success: true,
        data: mockData,
        count: mockData.length,
        total: mockData.length,
        isMock: true,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: mockData.length,
        },
      });
    }

    res.json({
      success: true,
      data: result.stories,
      count: result.stories.length,
      total: result.total,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error(`❌ Error in getStories, returning mock data:`, error);

    let mockData = MOCK_STORIES;
    if (level) {
      mockData = mockData.filter((s) => s.level === level.toUpperCase());
    }

    res.json({
      success: true,
      data: mockData,
      count: mockData.length,
      total: mockData.length,
      isMock: true,
      error: error.message,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: mockData.length,
      },
    });
  }
});

/**
 * Get a single story
 * GET /api/stories/:id
 */
export const getStory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  logger.info(`📚 Getting story: ${id}`);

  const story = await storyService.getStory(id, userId);

  if (!story) {
    // Check mock data
    const mockStory = MOCK_STORIES.find((s) => s.id === id);
    if (mockStory) {
      return res.json({
        success: true,
        data: mockStory,
        isMock: true,
      });
    }
    throw new NotFoundError({
      message: "Story not found",
      resource: { model: "Story", id },
    });
  }

  res.json({
    success: true,
    data: story,
  });
});

/**
 * Start a story
 * POST /api/stories/:id/start
 */
export const startStory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  logger.info(`📚 Starting story: ${id} for user: ${userId}`);

  const progress = await storyService.startStory(userId, id);

  res.json({
    success: true,
    data: progress,
    message: progress.status === "in_progress" ? "Story started" : "Story already in progress",
  });
});

/**
 * Update story progress
 * PUT /api/stories/:id/progress
 */
export const updateStoryProgress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { progress, status } = req.body;

  logger.info(`📚 Updating story progress: ${id} for user: ${userId}`);

  const result = await storyService.updateProgress(userId, id, { progress, status });

  res.json({
    success: true,
    data: result.storyProgress,
    xpEarned: result.xpEarned,
    isCompleted: result.isCompleted,
  });
});

/**
 * Get story progress
 * GET /api/stories/:id/progress
 */
export const getStoryProgress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const progress = await storyService.getProgress(userId, id);

  res.json({
    success: true,
    data: progress,
  });
});

export default {
  getStories,
  getStory,
  startStory,
  updateStoryProgress,
  getStoryProgress,
};
