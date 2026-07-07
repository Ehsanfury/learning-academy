/**
 * levelRoutes.js
 * Path: backend/routes/levelRoutes.js
 * Description: Level routes
 */

import express from "express";
import {
  getLevels,
  getLevelById,
  getLevelProgress,
  getLevelStats,
  getSuggestions,
  checkLevelLock,
  resetLevelProgress,
  getRecommendations,
} from "../controllers/levelsController.js";

const router = express.Router();

// ============================================
// 📊 Level Routes
// ============================================

/**
 * GET /api/levels
 * Get all levels
 */
router.get("/", getLevels);

/**
 * GET /api/levels/stats
 * Get level statistics
 */
router.get("/stats", getLevelStats);

/**
 * GET /api/levels/suggestions
 * Get level suggestions
 */
router.get("/suggestions", getSuggestions);

/**
 * GET /api/levels/recommendations
 * Get level recommendations
 */
router.get("/recommendations", getRecommendations);

/**
 * GET /api/levels/:id
 * Get level by ID
 */
router.get("/:id", getLevelById);

/**
 * GET /api/levels/:id/progress
 * Get level progress
 */
router.get("/:id/progress", getLevelProgress);

/**
 * GET /api/levels/:id/lock
 * Check level lock status
 */
router.get("/:id/lock", checkLevelLock);

/**
 * POST /api/levels/:id/reset
 * Reset level progress (admin only)
 */
router.post("/:id/reset", resetLevelProgress);

export default router;
