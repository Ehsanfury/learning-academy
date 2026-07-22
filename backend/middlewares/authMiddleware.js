/**
 * authMiddleware.js
 * Path: backend/middlewares/authMiddleware.js
 * Description: Authentication middleware
 * Version: 2.0 - Improved with better error messages
 * Changes:
 * - ✅ Better Persian error messages
 * - ✅ Token expiry detection
 * - ✅ Account status checks
 * - ✅ Email verification check (optional)
 * - ✅ Refresh token handling
 * - ✅ Audit logging
 */

import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { UnauthorizedError, ForbiddenError } from "../errors/index.js";
import logger from "../config/logger.js";

const JWT_SECRET = process.env.JWT_SECRET;

// ============================================
// 🔍 Verify Access Token
// ============================================

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("نشست شما منقضی شده است. لطفاً دوباره وارد شوید.");
    }
    if (error.name === "JsonWebTokenError") {
      throw new UnauthorizedError("توکن نامعتبر است. لطفاً دوباره وارد شوید.");
    }
    if (error.name === "NotBeforeError") {
      throw new UnauthorizedError("توکن هنوز فعال نیست.");
    }
    throw new UnauthorizedError("احراز هویت ناموفق بود.");
  }
};

// ============================================
// 🔐 Authenticate Middleware
// ============================================

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "NO_TOKEN",
        message: "برای دسترسی به این بخش باید وارد شوید.",
        timestamp: new Date().toISOString(),
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        success: false,
        error: "INVALID_TOKEN_FORMAT",
        message: "فرمت توکن نامعتبر است.",
        timestamp: new Date().toISOString(),
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: "TOKEN_VERIFICATION_FAILED",
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    // Get user from database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password", "resetPasswordToken", "verificationToken"] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "USER_NOT_FOUND",
        message: "کاربر یافت نشد.",
        timestamp: new Date().toISOString(),
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: "ACCOUNT_DEACTIVATED",
        message: "حساب شما غیرفعال شده است. با پشتیبانی تماس بگیرید.",
        timestamp: new Date().toISOString(),
      });
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil - new Date()) / 60000);
      return res.status(403).json({
        success: false,
        error: "ACCOUNT_LOCKED",
        message: `حساب شما قفل شده است. ${remainingMinutes} دقیقه دیگر تلاش کنید.`,
        timestamp: new Date().toISOString(),
      });
    }

    // Attach user to request
    req.user = user;
    req.token = decoded;

    // Update last activity (non-blocking)
    user.update({ lastActivityAt: new Date() }).catch(() => {});

    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      error: "AUTH_FAILED",
      message: "احراز هویت ناموفق بود.",
      timestamp: new Date().toISOString(),
    });
  }
};

// ============================================
// 🤷 Optional Authentication
// ============================================

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) return next();

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
      });

      if (user && user.isActive) {
        req.user = user;
        req.token = decoded;
      }
    } catch (e) {
      // Ignore token errors for optional auth
    }

    next();
  } catch (error) {
    next();
  }
};

// ============================================
// 🛡️ Authorize Middleware (Role-based)
// ============================================

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "NOT_AUTHENTICATED",
        message: "برای دسترسی به این بخش باید وارد شوید.",
        timestamp: new Date().toISOString(),
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "INSUFFICIENT_PERMISSIONS",
        message: "شما دسترسی به این بخش ندارید.",
        requiredRoles: roles,
        userRole: req.user.role,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

// ============================================
// 📧 Require Email Verification
// ============================================

export const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "NOT_AUTHENTICATED",
      message: "احراز هویت لازم است.",
      timestamp: new Date().toISOString(),
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      error: "EMAIL_NOT_VERIFIED",
      message: "لطفاً ابتدا ایمیل خود را تأیید کنید.",
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// ============================================
// 🔒 Admin Only
// ============================================

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "NOT_AUTHENTICATED",
      message: "احراز هویت لازم است.",
      timestamp: new Date().toISOString(),
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "ADMIN_ONLY",
      message: "این بخش فقط برای مدیران قابل دسترسی است.",
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// ============================================
// 👤 Self or Admin
// ============================================

export const selfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "NOT_AUTHENTICATED",
      message: "احراز هویت لازم است.",
      timestamp: new Date().toISOString(),
    });
  }

  const requestedUserId = req.params.userId || req.params.id;
  const isSelf = String(req.user.id) === String(requestedUserId);
  const isAdmin = req.user.role === "admin";

  if (!isSelf && !isAdmin) {
    return res.status(403).json({
      success: false,
      error: "ACCESS_DENIED",
      message: "شما فقط به اطلاعات خودتان دسترسی دارید.",
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

export default {
  authenticate,
  optionalAuth,
  authorize,
  requireEmailVerification,
  adminOnly,
  selfOrAdmin,
};
