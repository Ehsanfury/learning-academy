/**
 * authRoutes.js
 * Path: backend/routes/authRoutes.js
 * Description: Authentication routes
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

export default router;
