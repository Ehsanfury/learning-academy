/**
 * exerciseRoutes.js
 * Path: backend/routes/exerciseRoutes.js
 * Description: Exercise routes
 * Changes:
 * - ✅ FIXED: Added GET /lesson/:lessonId route
 * - ✅ FIXED: All routes properly defined
 */

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getExercisesByLesson,
  generateExercise,
  submitExercise,
  getExerciseHistory,
  getExerciseStats,
  getExerciseTypes,
  getDifficultyLevels,
} from "../controllers/exerciseController.js";

const router = express.Router();

// ============================================
// 🏋️ Exercise Routes
// ============================================

// ✅ FIXED: GET /lesson/:lessonId - Get exercises by lesson
router.get("/lesson/:lessonId", authenticate, getExercisesByLesson);

// POST /generate - Generate exercise from lesson
router.post("/generate", authenticate, generateExercise);

// POST /submit - Submit exercise answers
router.post("/submit", authenticate, submitExercise);

// GET /history - Get user exercise history
router.get("/history", authenticate, getExerciseHistory);

// GET /stats - Get user exercise statistics
router.get("/stats", authenticate, getExerciseStats);

// GET /types - Get exercise types
router.get("/types", authenticate, getExerciseTypes);

// GET /levels - Get difficulty levels
router.get("/levels", authenticate, getDifficultyLevels);

export default router;
