/**
 * progressRoutes.js
 * Path: backend/routes/progressRoutes.js
 * Description: User progress routes
 * Changes:
 * - ✅ FIXED: Added /dashboard route
 * - ✅ FIXED: Added /weekly-activity route
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
  getDashboard,
  getWeeklyActivity,
} from "../controllers/progressController.js";

const router = express.Router();

// ✅ همه مسیرها نیاز به احراز هویت دارند
router.use(authenticate);

// ✅ مسیرهای اصلی
router.get("/", getProgress);
router.get("/stats", getStats);
router.post("/", updateProgress);

// ✅ مسیرهای پیشرفته
router.get("/in-progress", getInProgressLessons);
router.get("/last-completed", getLastCompletedLesson);
router.get("/completed", getCompletedLessons);
router.get("/level-distribution", getLevelDistribution);
router.get("/daily-stats", getDailyStats);

// ✅ NEW: Dashboard overview
router.get("/dashboard", getDashboard);
router.get("/weekly-activity", getWeeklyActivity);

// ✅ مسیرهای مربوط به یک درس خاص
router.get("/lesson/:lessonId", getLessonProgress);

export default router;
