/**
 * authRoutes.js
 * Path: backend/routes/authRoutes.js
 * Description: Authentication routes
 * Changes:
 * - ✅ Added admin stats endpoint (real implementation)
 * - ✅ Fixed rate limiting
 * - ✅ Added proper validation
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

// Register with rate limiting
router.post("/register", registerLimiter, register);

// Login with rate limiting
router.post("/login", authLimiter, login);

// Refresh token
router.post("/refresh-token", refreshToken);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password", resetPassword);

// Verify email
router.get("/verify-email", verifyEmail);

// ============================================
// 🔒 Protected Routes (Auth Required)
// ============================================

// All routes below require authentication
router.use(authenticate);

// Get current user
router.get("/me", getMe);

// Change password
router.post("/change-password", changePassword);

// Logout
router.post("/logout", logout);

// Resend verification
router.post("/resend-verification", resendVerification);

// ============================================
// 👑 Admin Routes
// ============================================

// ✅ FIXED: Admin stats - real implementation
router.get(
  "/admin/stats",
  authorize("admin"),
  asyncHandler(async (req, res) => {
    logInfo("📊 [Admin] Getting admin stats", { userId: req.user.id });

    // Get user stats
    const userStats = await userService.getAdminStats();

    res.json({
      success: true,
      data: userStats,
    });
  })
);

// Admin - Get all users
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

// Admin - Update user role
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

// Admin - Delete user
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
