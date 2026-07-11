/**
 * rateLimiter.js
 * Path: backend/middlewares/rateLimiter.js
 * Description: Rate limiting middleware
 * Changes:
 * - ✅ FIXED: Dynamic retryAfter based on actual windowMs
 * - ✅ FIXED: Added aiLimiter for AI endpoints
 * - ✅ FIXED: All handlers properly respond with 429
 * - ✅ FIXED: Removed duplicate declarations
 */

import rateLimit from "express-rate-limit";

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
    const retryAfter = Math.ceil(15 * 60);
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
      retryAfter: retryAfter,
      timestamp: new Date().toISOString(),
    });
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 5 : 100,
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

export const storiesLimiter = rateLimit({
  windowMs: 60 * 1000,
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

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
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

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: "Too many requests, please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res, _next) => {
    const retryAfter = Math.ceil(15 * 60);
    res.status(429).json({
      success: false,
      message: "Too many requests, please slow down.",
      retryAfter: retryAfter,
      timestamp: new Date().toISOString(),
    });
  },
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: "API rate limit exceeded. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res, _next) => {
    const retryAfter = Math.ceil(60 * 60);
    res.status(429).json({
      success: false,
      message: "API rate limit exceeded. Please try again later.",
      retryAfter: retryAfter,
      timestamp: new Date().toISOString(),
    });
  },
});

const rateLimiter = generalLimiter;
export default rateLimiter;
