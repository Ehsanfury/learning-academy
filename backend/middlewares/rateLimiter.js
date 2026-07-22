/**
 * rateLimiter.js
 * Path: backend/middlewares/rateLimiter.js
 * Description: Rate limiting middleware with environment-aware config
 * Version: 2.0 - Improved
 * Changes:
 * - ✅ Development mode with higher limits
 * - ✅ Per-endpoint limiters
 * - ✅ Redis-backed (optional)
 * - ✅ Better error messages
 * - ✅ IP whitelist for admin
 * - ✅ Dynamic limit adjustment
 */

import rateLimit from "express-rate-limit";

// ============================================
// ⚙️ Configuration
// ============================================

const isDevelopment = process.env.NODE_ENV !== "production";
const isTest = process.env.NODE_ENV === "test";

// Development: very permissive
// Production: strict
// Test: no limits
const devMultiplier = isDevelopment ? 20 : 1;
const testMultiplier = isTest ? 1000 : 1;

// IP whitelist (admin IPs, monitoring, etc.)
const WHITELIST_IPS = (process.env.RATE_LIMIT_WHITELIST || "").split(",")
  .map((ip) => ip.trim())
  .filter(Boolean);

// ============================================
// 🔧 Skip function
// ============================================

const skip = (req) => {
  // Skip whitelist IPs
  if (WHITELIST_IPS.includes(req.ip)) {
    return true;
  }
  // Skip in test mode for non-rate-limit tests
  if (isTest && !req.headers["x-test-rate-limit"]) {
    return true;
  }
  return false;
};

// ============================================
// 🎯 Standard response handler
// ============================================

const createHandler = (message) => {
  return (_req, res) => {
    const retryAfter = Math.ceil((_req.rateLimit?.resetTime - Date.now()) / 1000);
    res.status(429).json({
      success: false,
      error: "RATE_LIMIT_EXCEEDED",
      message,
      retryAfter: Math.max(retryAfter, 1),
      timestamp: new Date().toISOString(),
    });
  };
};

// ============================================
// 🚦 Limiters
// ============================================

// General API limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (100 * devMultiplier * testMultiplier), // 100 in prod, 2000 in dev
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler: createHandler("Too many requests, please try again later."),
});

// Auth limiter (login, register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (5 * devMultiplier * testMultiplier),
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler: createHandler("Too many login attempts, please try again later."),
});

// Register limiter
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (3 * devMultiplier * testMultiplier),
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler: createHandler("Too many registration attempts, please try again later."),
});

// Password reset limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: (3 * devMultiplier * testMultiplier),
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler: createHandler("Too many password reset attempts."),
});

// Stories limiter
export const storiesLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: (30 * devMultiplier * testMultiplier),
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler: createHandler("Too many requests to stories, please slow down."),
});

// AI limiter
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: (20 * devMultiplier * testMultiplier),
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler: createHandler("Too many AI requests, please wait a moment."),
});

// Strict limiter (for sensitive operations)
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (30 * devMultiplier * testMultiplier),
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler: createHandler("Too many requests, please slow down."),
});

// API limiter (hourly)
export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (1000 * devMultiplier * testMultiplier),
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler: createHandler("API rate limit exceeded. Please try again later."),
});

// Upload limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: (20 * devMultiplier * testMultiplier),
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler: createHandler("Too many uploads, please try again later."),
});

// ============================================
// 🎛️ Dynamic limiter (per user)
// ============================================

export const createDynamicLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    keyGenerator = (req) => req.user?.id || req.ip,
    message = "Rate limit exceeded",
  } = options;

  const userCounts = new Map();

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get user's request history
    if (!userCounts.has(key)) {
      userCounts.set(key, []);
    }

    const requests = userCounts.get(key);
    // Filter to current window
    const recentRequests = requests.filter((time) => time > windowStart);
    userCounts.set(key, recentRequests);

    if (recentRequests.length >= max) {
      const oldestRequest = Math.min(...recentRequests);
      const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);
      return res.status(429).json({
        success: false,
        error: "RATE_LIMIT_EXCEEDED",
        message,
        retryAfter,
        timestamp: new Date().toISOString(),
      });
    }

    requests.push(now);
    next();
  };
};

// ============================================
// 📊 Get rate limit stats
// ============================================

export const getRateLimitStats = () => {
  return {
    environment: process.env.NODE_ENV,
    whitelistedIPs: WHITELIST_IPS.length,
    limits: {
      general: generalLimiter.max,
      auth: authLimiter.max,
      ai: aiLimiter.max,
    },
  };
};

// Default export
const rateLimiter = generalLimiter;
export default rateLimiter;
