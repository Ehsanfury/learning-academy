/**
 * errorHandler.js
 * Path: backend/middlewares/errorHandler.js
 * Description: Central error handling middleware
 * Changes:
 * - ✅ Fixed import: ApiError -> AppError
 * - ✅ Added proper error handling
 * - ✅ Added logging for all errors
 * - ✅ Added validation error handling
 * - ✅ Added async handler wrapper
 */

import { logError } from "../config/logger.js";
import { AppError, ValidationError, NotFoundError, UnauthorizedError } from "../errors/index.js";

// ============================================
// 🎯 Async Handler - Wraps async route handlers
// ============================================

/**
 * Wraps an async function to catch errors and pass to error handler
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ============================================
// ❌ Error Handler Middleware
// ============================================

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export const errorHandler = (err, req, res, next) => {
  // Log error
  logError(`❌ Error: ${err.message}`, {
    error: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let details = err.details || null;

  // Handle specific error types
  if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
    statusCode = 400;
    message = "Validation error";
    details =
      err.errors?.map((e) => ({
        field: e.path,
        message: e.message,
      })) || null;
  }

  if (err.name === "SequelizeForeignKeyConstraintError") {
    statusCode = 400;
    message = "Related record not found";
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Handle custom error classes
  if (err instanceof ValidationError) {
    statusCode = err.statusCode || 400;
    message = err.message || "Validation failed";
    details = err.details;
  }

  if (err instanceof NotFoundError) {
    statusCode = err.statusCode || 404;
    message = err.message || "Resource not found";
  }

  if (err instanceof UnauthorizedError) {
    statusCode = err.statusCode || 401;
    message = err.message || "Unauthorized";
  }

  // Handle AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode || 500;
    message = err.message || "An error occurred";
    details = err.details;
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

// ============================================
// 🔄 Not Found Handler
// ============================================

/**
 * 404 Not Found handler
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404);
  next(error);
};

// ============================================
// 📤 Exports
// ============================================

export default {
  asyncHandler,
  errorHandler,
  notFoundHandler,
};
