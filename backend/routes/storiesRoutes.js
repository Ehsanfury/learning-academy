/**
 * storiesRoutes.js
 * Path: backend/routes/storiesRoutes.js
 * Description: Stories routes
 * Changes:
 * - ✅ FIXED: Fixed imports to match controller exports
 * - ✅ FIXED: Added storiesLimiter to prevent 429
 */

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { storiesLimiter } from "../middlewares/rateLimiter.js";
// ✅ FIXED: Match actual exports from storiesController
import {
  getStories,
  getStory,
  startStory,
  updateStoryProgress,
  getStoryProgress,
} from "../controllers/storiesController.js";

const router = express.Router();

router.use(authenticate);

// ✅ FIXED: Added storiesLimiter
router.get("/", storiesLimiter, getStories);
router.get("/:id", getStory);
router.post("/:id/start", startStory);
router.put("/:id/progress", updateStoryProgress);
router.get("/:id/progress", getStoryProgress);

export default router;
