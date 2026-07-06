/**
 * userRoutes.js
 * Path: backend/routes/userRoutes.js
 * Description: User management routes
 * Changes:
 * - ✅ Added /settings routes
 * - ✅ All routes protected
 * - ✅ Admin routes added
 */

import express from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
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

// GET /profile - Get user profile
router.get("/profile", getProfile);

// PUT /profile - Update user profile
router.put("/profile", updateProfile);

// GET /stats - Get user stats
router.get("/stats", getStats);

// GET /streak - Get user streak
router.get("/streak", getStreak);

// GET /achievements - Get user achievements
router.get("/achievements", getAchievements);

// GET /activity - Get user recent activity
router.get("/activity", getRecentActivity);

// ============================================
// ⚙️ Settings Routes
// ============================================

// GET /settings - Get user settings
router.get("/settings", getSettings);

// PUT /settings - Update user settings
router.put("/settings", updateSettings);

// ============================================
// 🏆 Leaderboard Routes
// ============================================

// GET /leaderboard - Get leaderboard
router.get("/leaderboard", getLeaderboard);

// GET /rank - Get user rank
router.get("/rank", getUserRank);

// ============================================
// 🔍 Search Routes
// ============================================

// GET /search - Search users
router.get("/search", searchUsers);

// ============================================
// 🗑️ Account Management
// ============================================

// DELETE /account - Delete user account
router.delete("/account", deleteAccount);

// ============================================
// 👑 Admin Routes (Admin Only)
// ============================================

// GET /admin/stats - Admin stats
router.get("/admin/stats", authorize("admin"), async (req, res) => {
  const userService = (await import("../services/userService.js")).default;
  const stats = await userService.getAdminStats();
  res.json({
    success: true,
    data: stats,
  });
});

// GET /admin/users - Get all users (admin)
router.get("/admin/users", authorize("admin"), async (req, res) => {
  const { limit = 50, offset = 0, search = "" } = req.query;
  const userService = (await import("../services/userService.js")).default;
  const result = await userService.getUsers({
    limit: parseInt(limit),
    offset: parseInt(offset),
    search,
  });
  res.json({
    success: true,
    data: result,
  });
});

// PUT /admin/users/:userId/role - Update user role (admin)
router.put("/admin/users/:userId/role", authorize("admin"), async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!role || !["user", "admin"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Role must be 'user' or 'admin'",
    });
  }

  const userService = (await import("../services/userService.js")).default;
  const user = await userService.updateUserRole(userId, role);
  res.json({
    success: true,
    message: "User role updated successfully",
    data: user,
  });
});

// DELETE /admin/users/:userId - Delete user (admin)
router.delete("/admin/users/:userId", authorize("admin"), async (req, res) => {
  const { userId } = req.params;
  const userService = (await import("../services/userService.js")).default;
  await userService.deleteUser(userId);
  res.json({
    success: true,
    message: "User deleted successfully",
  });
});

export default router;
