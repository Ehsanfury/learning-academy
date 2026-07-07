/**
 * rateLimiter.js
 * Path: backend/middlewares/rateLimiter.js
 * Description: Rate limiting middleware
 * Changes:
 * - ✅ FIXED: All exports properly defined
 * - ✅ FIXED: Added default export as a combined middleware
 */

import rateLimit from "express-rate-limit";

/**
 * General rate limiter - 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res, _next, _options) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
      retryAfter: Math.ceil(15 * 60),
    });
  },
});

/**
 * Strict rate limiter - 30 requests per 15 minutes
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: {
    success: false,
    message: "Too many requests, please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res, _next, _options) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please slow down.",
      retryAfter: Math.ceil(15 * 60),
    });
  },
});

/**
 * Auth rate limiter - 5 requests per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res, _next, _options) => {
    res.status(429).json({
      success: false,
      message: "Too many login attempts, please try again later.",
      retryAfter: Math.ceil(15 * 60),
    });
  },
});

/**
 * Register rate limiter - 5 requests per 15 minutes
 */
export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: "Too many registration attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res, _next, _options) => {
    res.status(429).json({
      success: false,
      message: "Too many registration attempts, please try again later.",
      retryAfter: Math.ceil(15 * 60),
    });
  },
});

/**
 * API rate limiter - 1000 requests per hour
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  message: {
    success: false,
    message: "API rate limit exceeded. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res, _next, _options) => {
    res.status(429).json({
      success: false,
      message: "API rate limit exceeded. Please try again later.",
      retryAfter: Math.ceil(60 * 60),
    });
  },
});

/**
 * ✅ DEFAULT EXPORT - Combined rate limiter for app.use("/api", rateLimiter)
 * This applies generalLimiter to all /api routes
 */
const rateLimiter = generalLimiter;

export default rateLimiter;
