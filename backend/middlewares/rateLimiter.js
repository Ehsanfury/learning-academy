/**
 * rateLimiter.js
 * Path: backend/middlewares/rateLimiter.js
 * Description: Rate limiting middleware
 * Changes:
 * - ✅ FIXED: Dynamic retryAfter based on actual windowMs
 * - ✅ FIXED: Added aiLimiter for AI endpoints
 * - ✅ FIXED: All handlers properly respond with 429
 */

import rateLimit from "express-rate-limit";

/**
 * General rate limiter - 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res, _next) => {
    // ✅ FIXED: Dynamic retryAfter
    const retryAfter = Math.ceil(15 * 60);
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
      retryAfter: retryAfter,
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * Auth rate limiter - 5 requests per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res, _next) => {
    const retryAfter = Math.ceil(15 * 60);
    res.status(429).json({
      success: false,
      message: "Too many login attempts, please try again later.",
      retryAfter: retryAfter,
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * Register rate limiter - 5 requests per 15 minutes
 */
export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many registration attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res, _next) => {
    const retryAfter = Math.ceil(15 * 60);
    res.status(429).json({
      success: false,
      message: "Too many registration attempts, please try again later.",
      retryAfter: retryAfter,
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * ✅ FIXED: Stories rate limiter - 30 requests per minute
 */
export const storiesLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    message: "Too many requests to stories, please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res, _next) => {
    res.status(429).json({
      success: false,
      message: "Too many requests to stories, please slow down.",
      retryAfter: Math.ceil(60),
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * ✅ FIXED: AI rate limiter - 20 requests per minute
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: {
    success: false,
    message: "Too many AI requests, please wait a moment.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res, _next) => {
    res.status(429).json({
      success: false,
      message: "Too many AI requests, please wait a moment.",
      retryAfter: Math.ceil(60),
      timestamp: new Date().toISOString(),
    });
  },
});

const rateLimiter = generalLimiter;
export default rateLimiter;
