/**
 * userRoutes.js
 * Path: backend/routes/userRoutes.js
 * Description: User management routes
 */

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getProfile,
  updateProfile,
  getStats,
  getStreak,
  getAchievements,
  getRecentActivity,
  getLeaderboard,
  getUserRank,
  searchUsers,
  getSettings,
  updateSettings,
  deleteAccount,
} from "../controllers/userController.js";

const router = express.Router();

// ============================================
// 🔒 All routes require authentication
// ============================================

router.use(authenticate);

// ============================================
// 👤 Profile Routes
// ============================================

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.get("/stats", getStats);
router.get("/streak", getStreak);
router.get("/achievements", getAchievements);
router.get("/activity", getRecentActivity);

// ============================================
// ⚙️ Settings Routes
// ============================================

router.get("/settings", getSettings);
router.put("/settings", updateSettings);

// ============================================
// 🏆 Leaderboard Routes
// ============================================

router.get("/leaderboard", getLeaderboard);
router.get("/rank", getUserRank);

// ============================================
// 🔍 Search Routes
// ============================================

router.get("/search", searchUsers);

// ============================================
// 🗑️ Account Management
// ============================================

router.delete("/account", deleteAccount);

export default router;
