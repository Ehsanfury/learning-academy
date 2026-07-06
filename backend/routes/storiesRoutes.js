/**
 * storiesRoutes.js
 * Path: backend/routes/storiesRoutes.js
 * Description: Stories routes
 * Changes:
 * - Added new routes for story progress
 */

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getStories,
  getStory,
  startStory,
  updateStoryProgress,
} from "../controllers/storiesController.js";

const router = express.Router();

router.use(authenticate);

// Get all stories
router.get("/", getStories);

// Get a single story
router.get("/:id", getStory);

// Start a story
router.post("/:id/start", startStory);

// Update story progress
router.put("/:id/progress", updateStoryProgress);

export default router;
