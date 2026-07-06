/**
 * lessonApi.js
 * Path: src/services/lessonApi.js
 * Description: Lesson API service
 * Version: 2.0 - Fixed API paths and added all methods
 * Changes:
 * - ✅ FIXED: Removed duplicate /api from paths
 * - ✅ FIXED: Added getAllLessons method
 * - ✅ FIXED: Added getLessonsByLevel with proper params
 * - ✅ FIXED: Added progress tracking methods
 * - ✅ FIXED: Added lock status check
 */

import api from "./api";

const lessonApi = {
  /**
   * Get all lessons (with filters)
   * GET /lessons
   */
  getAllLessons: async (params = {}) => {
    return api.get("/lessons", { params });
  },

  /**
   * Get lesson by ID
   * GET /lessons/:id
   */
  getLesson: async (lessonId) => {
    return api.get(`/lessons/${lessonId}`);
  },

  /**
   * Get lessons by level
   * GET /lessons?level=:level
   */
  getLessonsByLevel: async (level, params = {}) => {
    return api.get("/lessons", {
      params: {
        level,
        ...params,
      },
    });
  },

  /**
   * Complete a lesson
   * POST /lessons/:id/complete
   */
  completeLesson: async (lessonId, data = {}) => {
    return api.post(`/lessons/${lessonId}/complete`, data);
  },

  /**
   * Get next lesson
   * GET /lessons/next
   */
  getNextLesson: async (currentLessonId) => {
    return api.get("/lessons/next", {
      params: { currentId: currentLessonId },
    });
  },

  /**
   * Get lesson progress
   * GET /lessons/:id/progress
   */
  getLessonProgress: async (lessonId) => {
    return api.get(`/lessons/${lessonId}/progress`);
  },

  /**
   * Submit answer for a question
   * POST /lessons/:id/answer
   */
  submitAnswer: async (lessonId, questionId, answer) => {
    return api.post(`/lessons/${lessonId}/answer`, {
      questionId,
      answer,
    });
  },

  /**
   * Get lesson statistics
   * GET /lessons/stats
   */
  getLessonStats: async () => {
    return api.get("/lessons/stats");
  },

  /**
   * Get lesson suggestions
   * GET /lessons/suggestions
   */
  getSuggestions: async (params = {}) => {
    return api.get("/lessons/suggestions", { params });
  },

  /**
   * Check lesson lock status
   * GET /lessons/:id/lock
   */
  checkLessonLock: async (lessonId) => {
    return api.get(`/lessons/${lessonId}/lock`);
  },

  /**
   * Reset lesson progress (admin only)
   * POST /lessons/:id/reset
   */
  resetLessonProgress: async (lessonId) => {
    return api.post(`/lessons/${lessonId}/reset`);
  },

  /**
   * Get all levels
   * GET /lessons/levels
   */
  getLevels: async () => {
    return api.get("/lessons/levels");
  },

  /**
   * Get level progress
   * GET /lessons/levels/:level
   */
  getLevelProgress: async (level) => {
    return api.get(`/lessons/levels/${level}`);
  },
};

export default lessonApi;
