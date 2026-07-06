/**
 * progressRoutes.js
 * German Academy
 User progress routes
 */

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getProgress,
  getStats,
  updateProgress,
  getLessonProgress,
  getInProgressLessons,
  getLastCompletedLesson,
  getCompletedLessons,
  getLevelDistribution,
  getDailyStats,
} from "../controllers/progressController.js";

const router = express.Router();

// TODO: Translate - TODO: Translate - همه مسیرها نیاز به احراز هویت دارند
router.use(authenticate);

// TODO: Translate - TODO: Translate - مسیرهای اصلی
router.get("/", getProgress);
router.get("/stats", getStats);
router.post("/", updateProgress);

// TODO: Translate - TODO: Translate - مسیرهای پیشرفته
router.get("/in-progress", getInProgressLessons);
router.get("/last-completed", getLastCompletedLesson);
router.get("/completed", getCompletedLessons);
router.get("/level-distribution", getLevelDistribution);
router.get("/daily-stats", getDailyStats);

// TODO: Translate - TODO: Translate - مسیرهای مربوط به یک درس خاص
router.get("/lesson/:lessonId", getLessonProgress);

export default router;
