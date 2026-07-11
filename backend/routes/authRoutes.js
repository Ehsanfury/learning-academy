/**
 * authRoutes.js
 * Path: backend/routes/authRoutes.js
 * Description: Authentication routes
 * Changes:
 * - ✅ FIXED: Added /refresh endpoint (without -token)
 * - ✅ FIXED: Both /refresh and /refresh-token work
 * - ✅ FIXED: Removed duplicate imports
 * - ✅ FIXED: Added rate limiting to sensitive endpoints
 */

import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  resendVerification,
} from "../controllers/authController.js";
import { authLimiter, registerLimiter } from "../middlewares/rateLimiter.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import userService from "../services/userService.js";
import { logInfo } from "../config/logger.js";

const router = express.Router();

// ============================================
// 🔐 Public Routes (No Auth Required)
// ============================================

router.post("/register", registerLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", authLimiter, refreshToken);
router.post("/refresh-token", authLimiter, refreshToken);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.get("/verify-email", verifyEmail);

// ============================================
// 🔒 Protected Routes (Auth Required)
// ============================================

router.use(authenticate);

router.get("/me", getMe);
router.post("/change-password", changePassword);
router.post("/logout", logout);
router.post("/resend-verification", resendVerification);

// ============================================
// 👑 Admin Routes
// ============================================

router.get(
  "/admin/stats",
  authorize("admin"),
  asyncHandler(async (req, res) => {
    logInfo("📊 [Admin] Getting admin stats", { userId: req.user.id });

    const userStats = await userService.getAdminStats();

    res.json({
      success: true,
      data: userStats,
    });
  })
);

router.get(
  "/admin/users",
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const { limit = 50, offset = 0, search } = req.query;

    logInfo("👥 [Admin] Getting users list", {
      userId: req.user.id,
      limit,
      offset,
      search,
    });

    const result = await userService.getUsers({
      limit: parseInt(limit),
      offset: parseInt(offset),
      search,
    });

    res.json({
      success: true,
      data: result,
    });
  })
);

router.put(
  "/admin/users/:userId/role",
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    logInfo("👑 [Admin] Updating user role", {
      adminId: req.user.id,
      userId,
      role,
    });

    const user = await userService.updateUserRole(userId, role);

    res.json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  })
);

router.delete(
  "/admin/users/:userId",
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    logInfo("🗑️ [Admin] Deleting user", {
      adminId: req.user.id,
      userId,
    });

    await userService.deleteUser(userId);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  })
);

export default router;
