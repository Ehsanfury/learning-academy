/**
 * authController.js
 * Path: backend/controllers/authController.js
 * Description: Authentication controller
 * Changes:
 * - ✅ Fixed: validateLogin/validateRegister return { valid, data, ... } — now correctly accessing .data
 * - ✅ Fixed: resetPassword validator field name mismatch (newPassword vs password)
 * - ✅ Using authService for all auth operations
 * - ✅ Proper error handling with custom errors
 * - ✅ Refresh token in httpOnly cookie
 * - ✅ Rate limiting applied
 * - ✅ Input validation
 * - ✅ Proper response structure
 */

import authService from "../services/authService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import {
  validateLogin,
  validateRegister,
  validateResetPassword,
} from "../validators/auth.validator.js";
import { AppError, ValidationError, UnauthorizedError } from "../errors/index.js";
import logger from "../config/logger.js";

// ============================================
// 🍪 Cookie Options
// ============================================

const getCookieOptions = (req) => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };
};

// ============================================
// 📝 Controllers
// ============================================

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  // Validate input
  const validation = validateRegister(req.body);
  if (!validation.valid) {
    throw new ValidationError({
      message: validation.message,
      details: validation.errors,
    });
  }
  const validatedData = validation.data;

  // Register user
  const result = await authService.register(validatedData);

  // Set refresh token cookie
  res.cookie("refreshToken", result.refreshToken, getCookieOptions(req));

  // Remove refresh token from response body
  delete result.refreshToken;

  logger.info(`User registered: ${result.user.email}`, { userId: result.user.id });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  // Validate input
  const validation = validateLogin(req.body);
  if (!validation.valid) {
    throw new ValidationError({
      message: validation.message,
      details: validation.errors,
    });
  }
  const validatedData = validation.data;

  // Login user
  const result = await authService.login(validatedData.email, validatedData.password, req);

  // Set refresh token cookie
  res.cookie("refreshToken", result.refreshToken, getCookieOptions(req));

  // Remove refresh token from response body
  delete result.refreshToken;

  logger.info(`User logged in: ${result.user.email}`, { userId: result.user.id });

  res.json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
export const refreshToken = asyncHandler(async (req, res) => {
  // Get refresh token from cookie
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new UnauthorizedError("Refresh token not found");
  }

  // Refresh access token
  const result = await authService.refreshAccessToken(refreshToken, req);

  logger.info("Access token refreshed", { userId: result.user?.id });

  res.json({
    success: true,
    message: "Token refreshed successfully",
    data: result,
  });
});

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const refreshToken = req.cookies?.refreshToken;

  // Logout user
  await authService.logout(userId, refreshToken);

  // Clear refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  });

  logger.info(`User logged out: ${userId}`);

  res.json({
    success: true,
    message: "Logout successful",
  });
});

/**
 * Get current user
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  const user = await authService.getUserProfile(userId);

  res.json({
    success: true,
    data: { user },
  });
});

/**
 * Forgot password
 * POST /api/auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ValidationError({
      message: "Email is required",
      details: [{ field: "email", message: "Email is required" }],
    });
  }

  await authService.forgotPassword(email);

  // Always return success (don't reveal if user exists)
  res.json({
    success: true,
    message: "If an account exists with this email, you will receive a password reset link",
  });
});

/**
 * Reset password
 * POST /api/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  // Validate input — validator expects { token, password }
  const validation = validateResetPassword({ token, password: newPassword });
  if (!validation.valid) {
    throw new ValidationError({
      message: validation.message,
      details: validation.errors,
    });
  }
  const validatedData = validation.data;

  await authService.resetPassword(validatedData.token, validatedData.password);

  logger.info("Password reset successful");

  res.json({
    success: true,
    message: "Password reset successful",
  });
});

/**
 * Change password (authenticated)
 * POST /api/auth/change-password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  if (!currentPassword || !newPassword) {
    throw new ValidationError({
      message: "Current password and new password are required",
      details: [
        { field: "currentPassword", message: "Current password is required" },
        { field: "newPassword", message: "New password is required" },
      ],
    });
  }

  await authService.changePassword(userId, currentPassword, newPassword);

  logger.info(`Password changed for user: ${userId}`);

  res.json({
    success: true,
    message: "Password changed successfully",
  });
});

/**
 * Verify email
 * GET /api/auth/verify-email
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw new ValidationError({
      message: "Verification token is required",
      details: [{ field: "token", message: "Token is required" }],
    });
  }

  await authService.verifyEmail(token);

  res.json({
    success: true,
    message: "Email verified successfully",
  });
});

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
export const resendVerification = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Not authenticated");
  }

  await authService.resendVerificationEmail(userId);

  res.json({
    success: true,
    message: "Verification email sent",
  });
});
