/**
 * rateLimiter.js
 * Path: backend/middlewares/rateLimiter.js
 * Description: Rate limiting middleware configuration
 * Changes:
 * - ✅ FIXED: Removed custom ipKeyGenerator (use default)
 * - ✅ Fixed rate limiter configuration
 * - ✅ Added proper error handling
 */

import rateLimit from "express-rate-limit";
import { RateLimitError } from "../errors/index.js";

// ============================================
// 📊 General API Rate Limiter
// ============================================

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  handler: (req, res) => {
    throw new RateLimitError({
      message: "Too many requests, please try again later.",
      statusCode: 429,
    });
  },
  skip: (req) => {
    // Skip rate limiting for admin users
    return req.user?.role === "admin";
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// 🔐 Auth Rate Limiter (Stricter)
// ============================================

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per windowMs
  handler: (req, res) => {
    throw new RateLimitError({
      message: "Too many login attempts, please try again later.",
      statusCode: 429,
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// 📝 Register Rate Limiter (Stricter)
// ============================================

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 registrations per hour
  handler: (req, res) => {
    throw new RateLimitError({
      message: "Too many registration attempts, please try again later.",
      statusCode: 429,
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// 🔄 Password Reset Rate Limiter
// ============================================

export const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset attempts per hour
  handler: (req, res) => {
    throw new RateLimitError({
      message: "Too many password reset attempts, please try again later.",
      statusCode: 429,
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// 📤 Default Export
// ============================================

export default apiLimiter;
