/**
 * errorHandler.js
 * Path: backend/middlewares/errorHandler.js
 * Description: Global error handler middleware
 * Version: 2.0 - Improved with error reporting
 * Changes:
 * - ✅ Sentry integration
 * - ✅ Error tracking service
 * - ✅ Better error categorization
 * - ✅ Sanitize sensitive data
 * - ✅ Different responses for dev/prod
 * - ✅ Request ID for debugging
 * - ✅ Better 404 handler
 */

import logger from "../config/logger.js";
import { trackError } from "../services/errorTracking.js";

// ============================================
// 🧹 Sanitize sensitive data
// ============================================

const SENSITIVE_FIELDS = [
  "password",
  "currentPassword",
  "newPassword",
  "confirmPassword",
  "token",
  "refreshToken",
  "accessToken",
  "creditCard",
  "cvv",
  "cardNumber",
  "secret",
  "apiKey",
  "privateKey",
  "ssn",
];

const sanitizeBody = (body) => {
  if (!body || typeof body !== "object") return body;
  if (Array.isArray(body)) return body;

  const safe = { ...body };
  SENSITIVE_FIELDS.forEach((field) => {
    if (field in safe) {
      safe[field] = "[REDACTED]";
    }
  });

  // Also sanitize nested objects
  for (const key of Object.keys(safe)) {
    if (typeof safe[key] === "object" && safe[key] !== null) {
      safe[key] = sanitizeBody(safe[key]);
    }
  }

  return safe;
};

const sanitizeQuery = (query) => {
  if (!query || typeof query !== "object") return query;
  const safe = { ...query };
  ["token", "key", "secret", "access_token", "refresh_token"].forEach((field) => {
    if (field in safe) {
      safe[field] = "[REDACTED]";
    }
  });
  return safe;
};

// ============================================
// 🏷️ Generate Request ID
// ============================================

const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================
// 🚨 Global Error Handler
// ============================================

export const errorHandler = (err, req, res, _next) => {
  // Generate request ID for tracking
  const requestId = req.headers["x-request-id"] || generateRequestId();

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // ============================================
  // 📊 Log error with context
  // ============================================

  const errorContext = {
    requestId,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    request: {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      userId: req.user?.id || "anonymous",
      body: sanitizeBody(req.body),
      query: sanitizeQuery(req.query),
      params: req.params,
    },
    timestamp: new Date().toISOString(),
  };

  // Log based on severity
  if (statusCode >= 500) {
    logger.error(`🚨 Server Error [${requestId}]: ${err.message}`, errorContext);
  } else if (statusCode >= 400) {
    logger.warn(`⚠️ Client Error [${requestId}]: ${err.message}`, errorContext);
  }

  // ============================================
  // 📢 Track error (for monitoring/analytics)
  // ============================================

  if (statusCode >= 500) {
    trackError(err, errorContext).catch(() => {
      // Silent fail - don't let tracking break the response
    });
  }

  // ============================================
  // 📤 Build response
  // ============================================

  const response = {
    success: false,
    error: err.code || err.name || "INTERNAL_ERROR",
    message: err.message || "خطای سرور رخ داده است.",
    requestId,
    timestamp: new Date().toISOString(),
  };

  // Add validation errors if present
  if (err.errors && Array.isArray(err.errors)) {
    response.errors = err.errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
    response.details = err.details || undefined;
  }

  // Sanitize message in production for 500 errors
  if (process.env.NODE_ENV === "production" && statusCode >= 500) {
    response.message = "خطای سرور رخ داده است. لطفاً بعداً تلاش کنید.";
    response.error = "INTERNAL_ERROR";
  }

  res.status(statusCode).json(response);
};

// ============================================
// 🚫 404 Not Found Handler
// ============================================

export const notFoundHandler = (req, res) => {
  // In production, don't expose route details
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({
      success: false,
      error: "NOT_FOUND",
      message: "مسیر مورد نظر یافت نشد.",
      timestamp: new Date().toISOString(),
    });
  }

  // In development, show full details
  res.status(404).json({
    success: false,
    error: "NOT_FOUND",
    message: `مسیر ${req.method} ${req.url} یافت نشد.`,
    availableRoutes: "برای مشاهده مسیرها به /api/docs مراجعه کنید.",
    timestamp: new Date().toISOString(),
  });
};

// ============================================
// 🔄 Async Handler Wrapper
// ============================================

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ============================================
// 🚨 Unhandled Error Handlers
// ============================================

export const handleUncaughtExceptions = () => {
  process.on("uncaughtException", (error) => {
    logger.error("💥 Uncaught Exception:", error);
    trackError(error, { type: "uncaughtException" }).then(() => {
      process.exit(1);
    });
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
    trackError(new Error(reason?.message || "Unhandled Rejection"), {
      type: "unhandledRejection",
      reason: String(reason),
    });
  });
};

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  handleUncaughtExceptions,
};
