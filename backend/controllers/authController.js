/**
 * authController.js
 * Path: backend/controllers/authController.js
 * Description: Authentication controller
 * Changes:
 * - ✅ FIXED: getMe now uses authService.getUserProfile
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

export const register = asyncHandler(async (req, res) => {
  const validation = validateRegister(req.body);
  if (!validation.valid) {
    throw new ValidationError({
      message: validation.message,
      details: validation.errors,
    });
  }
  const validatedData = validation.data;

  const result = await authService.register(validatedData);

  res.cookie("refreshToken", result.refreshToken, getCookieOptions(req));

  delete result.refreshToken;

  logger.info(`User registered: ${result.user.email}`, { userId: result.user.id });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

export const login = asyncHandler(async (req, res) => {
  const validation = validateLogin(req.body);
  if (!validation.valid) {
    throw new ValidationError({
      message: validation.message,
      details: validation.errors,
    });
  }
  const validatedData = validation.data;

  const result = await authService.login(validatedData.email, validatedData.password, req);

  res.cookie("refreshToken", result.refreshToken, getCookieOptions(req));

  logger.info(`User logged in: ${result.user.email}`, { userId: result.user.id });

  res.json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ValidationError({
      message: "Refresh token is required",
      details: [{ field: "refreshToken", message: "Refresh token is required" }],
    });
  }

  const result = await authService.refreshAccessToken(refreshToken, req);

  res.cookie("refreshToken", result.refreshToken, getCookieOptions(req));

  res.json({
    success: true,
    data: {
      accessToken: result.accessToken,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const refreshToken = req.cookies?.refreshToken;

  await authService.logout(userId, refreshToken);

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

// ✅ FIXED: getMe now uses authService.getUserProfile
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

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ValidationError({
      message: "Email is required",
      details: [{ field: "email", message: "Email is required" }],
    });
  }

  await authService.forgotPassword(email);

  res.json({
    success: true,
    message: "If an account exists with this email, you will receive a password reset link",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

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
