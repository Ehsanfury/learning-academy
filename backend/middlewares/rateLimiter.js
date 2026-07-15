/**
 * rateLimiter.js
 * Path: backend/middlewares/rateLimiter.js
 * Description: Rate limiting middleware
 * Changes:
 * - ✅ FIXED: Higher limits for development environment
 */

import rateLimit from "express-rate-limit";

// ✅ افزایش محدودیت در محیط توسعه
const isDevelopment = process.env.NODE_ENV !== "production";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // ✅ 1000 درخواست در توسعه
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
  max: isDevelopment ? 50 : 5, // ✅ 50 درخواست در توسعه
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
  max: isDevelopment ? 50 : 5,
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
  max: isDevelopment ? 100 : 30,
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
  max: isDevelopment ? 50 : 20,
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
  max: isDevelopment ? 200 : 30,
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
  max: isDevelopment ? 5000 : 1000,
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
