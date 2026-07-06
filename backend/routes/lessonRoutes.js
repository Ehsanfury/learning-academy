/**
 * lessonRoutes.js
 * Path: backend/routes/lessonRoutes.js
 * Description: Lesson routes
 */

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getLessons,
  getLessonById,
  completeLesson,
  getLessonProgress,
  getLessonStats,
  getSuggestions,
  checkLessonLock,
  resetLessonProgress,
  getLevels,
  getLevelProgress,
} from "../controllers/lessonController.js";

const router = express.Router();

// ✅ همه مسیرها نیاز به احراز هویت دارند
router.use(authenticate);

// دریافت همه درس‌ها
router.get("/", getLessons);

// دریافت آمار درس‌ها
router.get("/stats", getLessonStats);

// دریافت پیشنهادات
router.get("/suggestions", getSuggestions);

// دریافت همه سطوح
router.get("/levels", getLevels);

// دریافت پیشرفت یک سطح
router.get("/levels/:level", getLevelProgress);

// دریافت درس با ID
router.get("/:id", getLessonById);

// دریافت پیشرفت یک درس
router.get("/:id/progress", getLessonProgress);

// بررسی قفل بودن درس
router.get("/:id/lock", checkLessonLock);

// تکمیل درس
router.post("/:id/complete", completeLesson);

// ریست پیشرفت درس (فقط ادمین)
router.post("/:id/reset", resetLessonProgress);

export default router;
