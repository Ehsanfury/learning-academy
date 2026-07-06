/**
 * exerciseApi.js
 * Path: src/services/exerciseApi.js
 * Description: Exercise API service
 * Changes:
 * - ✅ FIXED: Added getExercisesByLesson method
 * - ✅ FIXED: Removed duplicate /api from paths
 */

import api from "./api";
import debug from "../utils/debug";

export const exerciseApi = {
  /**
   * Get exercises by lesson ID
   * GET /exercises/lesson/:lessonId
   */
  getExercisesByLesson: async (lessonId) => {
    try {
      const response = await api.get(`/exercises/lesson/${lessonId}`);
      return response.data;
    } catch (error) {
      debug.error("Failed to get exercises:", error);
      throw error;
    }
  },

  /**
   * Generate exercise from lesson
   * POST /exercises/generate
   */
  generateExercise: async (params) => {
    try {
      const response = await api.post("/exercises/generate", params);
      return response.data;
    } catch (error) {
      debug.error("Failed to generate exercise:", error);
      throw error;
    }
  },

  /**
   * Submit exercise answers
   * POST /exercises/submit
   */
  submitExercise: async (data) => {
    try {
      const response = await api.post("/exercises/submit", data);
      return response.data;
    } catch (error) {
      debug.error("Failed to submit exercise:", error);
      throw error;
    }
  },

  /**
   * Get exercise types
   * GET /exercises/types
   */
  getExerciseTypes: async () => {
    try {
      const response = await api.get("/exercises/types");
      return response.data;
    } catch (error) {
      debug.error("Failed to get exercise types:", error);
      throw error;
    }
  },

  /**
   * Get difficulty levels
   * GET /exercises/levels
   */
  getDifficultyLevels: async () => {
    try {
      const response = await api.get("/exercises/levels");
      return response.data;
    } catch (error) {
      debug.error("Failed to get difficulty levels:", error);
      throw error;
    }
  },

  /**
   * Get exercise history
   * GET /exercises/history
   */
  getExerciseHistory: async (params = {}) => {
    try {
      const response = await api.get("/exercises/history", { params });
      return response.data;
    } catch (error) {
      debug.error("Failed to get exercise history:", error);
      throw error;
    }
  },

  /**
   * Get exercise stats
   * GET /exercises/stats
   */
  getExerciseStats: async () => {
    try {
      const response = await api.get("/exercises/stats");
      return response.data;
    } catch (error) {
      debug.error("Failed to get exercise stats:", error);
      throw error;
    }
  },
};

export default exerciseApi;
