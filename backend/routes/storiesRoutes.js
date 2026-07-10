/**
 * storiesRoutes.js
 * Path: backend/routes/storiesRoutes.js
 * Description: Stories routes
 */

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getStories,
  getStory,
  createStory,
  updateStory,
  deleteStory,
  startStory,
  getStoryProgress,
  updateStoryProgress,
} from "../controllers/storiesController.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getStories);
router.get("/:id", getStory);
router.post("/", createStory);
router.put("/:id", updateStory);
router.delete("/:id", deleteStory);
router.post("/:id/start", startStory);
router.get("/:id/progress", getStoryProgress);
router.put("/:id/progress", updateStoryProgress);

export default router;
