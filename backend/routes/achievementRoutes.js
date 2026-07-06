/**
 * achievementRoutes.js
 * German Academy
 Achievements routes
 * Changes:
 * - FIXED H15: Removed /check endpoint (XP farming prevention)
 * - All routes are protected with authentication
 */

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getAllAchievements,
  getUserAchievements,
  getUnviewedAchievements,
  markAchievementAsViewed,
  getAchievementStats,
  // checkAchievements, // ❌ REMOVED - XP farming
} from "../controllers/achievementController.js";

const router = express.Router();

// ============================================
// TODO: Translate - TODO: Translate - 🔒 همه مسیرها نیاز به احراز هویت دارند
// ============================================

router.use(authenticate);

// ============================================
// TODO: Translate - TODO: Translate - 📊 مسیرهای دستاوردها
// ============================================

/**
 * @route   GET /api/achievements
 Get all achievements with status for user
 * @access  Private
 */
router.get("/", getAllAchievements);

/**
 * @route   GET /api/achievements/my
 Get user earned achievements
 * @access  Private
 */
router.get("/my", getUserAchievements);

/**
 * @route   GET /api/achievements/unviewed
 Get unviewed achievements
 * @access  Private
 */
router.get("/unviewed", getUnviewedAchievements);

/**
 * @route   GET /api/achievements/stats
 Get user achievement statistics
 * @access  Private
 */
router.get("/stats", getAchievementStats);

/**
 * @route   PUT /api/achievements/:achievementId/view
 Mark achievement as viewed
 * @access  Private
 */
router.put("/:achievementId/view", markAchievementAsViewed);

// ============================================
// TODO: Translate - TODO: Translate - ❌ REMOVED: مسیرهای حذف شده برای جلوگیری از XP farming
// ============================================

/**
 * ❌ REMOVED: POST /api/achievements/check
// TODO: Translate - TODO: Translate - * دلیل: این مسیر به کاربران اجازه می‌داد دستاوردها را روی تقاضا trigger کنند
// TODO: Translate - TODO: Translate - * و XP farming انجام دهند.
 *
// TODO: Translate - TODO: Translate - * جایگزین: دستاوردها به صورت خودکار در پس‌زمینه بررسی می‌شوند
 Review word
 */
// router.post("/check", checkAchievements);

// ============================================
// 📤 Export
// ============================================

export default router;
