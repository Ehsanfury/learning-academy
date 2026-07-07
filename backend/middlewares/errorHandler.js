/**
 * errorHandler.js
 * Path: backend/middlewares/errorHandler.js
 * Description: Global error handler middleware
 * Changes:
 * - ✅ FIXED: Sanitize sensitive data from logs
 * - ✅ FIXED: Prevent password leakage in error logs
 */

import logger from "../config/logger.js";

/**
 * Sanitize request body - remove sensitive fields
 */
const sanitizeBody = (body) => {
  if (!body || typeof body !== "object") return body;
  if (Array.isArray(body)) return body;

  const safe = { ...body };
  const sensitiveFields = [
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
  ];

  sensitiveFields.forEach((field) => {
    if (field in safe) {
      safe[field] = "[REDACTED]";
    }
  });

  return safe;
};

/**
 * Sanitize query parameters
 */
const sanitizeQuery = (query) => {
  if (!query || typeof query !== "object") return query;
  const safe = { ...query };
  const sensitiveFields = ["token", "key", "secret"];
  sensitiveFields.forEach((field) => {
    if (field in safe) {
      safe[field] = "[REDACTED]";
    }
  });
  return safe;
};

/**
 * Global error handler
 */
export const errorHandler = (err, req, res, _next) => {
  // Log error with sanitized data
  logger.error(`❌ Error: ${err.message}`, {
    error: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id || "anonymous",
    body: sanitizeBody(req.body),
    query: sanitizeQuery(req.query),
    params: req.params,
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Build error response
  const response = {
    success: false,
    message: err.message || "Internal Server Error",
    timestamp: new Date().toISOString(),
  };

  // Add validation errors if present
  if (err.errors && Array.isArray(err.errors)) {
    response.errors = err.errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Async handler wrapper - catches errors in async route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
