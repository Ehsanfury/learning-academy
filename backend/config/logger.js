/**
 * logger.js
 * Path: backend/config/logger.js
 * Description: Winston logger configuration
 * Changes:
 * - ✅ Removed duplicate timestamp (Winston adds it automatically)
 * - ✅ Added separate log levels for different transports
 * - ✅ Added performance logging
 * - ✅ Added request ID tracking
 * - ✅ Added log rotation
 * - ✅ Added log formatting
 * - ✅ Fixed duplicate export of createChildLogger
 * - ✅ Fixed duplicate export of logPerformance
 */

import winston from "winston";
import path from "path";
import fs from "fs";
import config from "./env.js";

// ============================================
// 📁 Ensure log directory exists
// ============================================

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// ============================================
// 🎨 Custom Format
// ============================================

const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss.SSS",
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ level, message, timestamp, requestId, userId, ...meta }) => {
    let logEntry = `${timestamp} [${level.toUpperCase()}]`;

    if (requestId) {
      logEntry += ` [${requestId}]`;
    }

    if (userId) {
      logEntry += ` [User:${userId}]`;
    }

    logEntry += ` ${message}`;

    if (Object.keys(meta).length > 0) {
      logEntry += ` ${JSON.stringify(meta)}`;
    }

    return logEntry;
  })
);

// ============================================
// 🎨 Console Format (with colors)
// ============================================

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss.SSS",
  }),
  winston.format.printf(({ level, message, timestamp, requestId, userId, ...meta }) => {
    let logEntry = `${timestamp} ${level}`;

    if (requestId) {
      logEntry += ` [${requestId}]`;
    }

    if (userId) {
      logEntry += ` [User:${userId}]`;
    }

    logEntry += ` ${message}`;

    if (Object.keys(meta).length > 0) {
      logEntry += ` ${JSON.stringify(meta)}`;
    }

    return logEntry;
  })
);

// ============================================
// 📊 Create Logger
// ============================================

const logger = winston.createLogger({
  level: config.isProduction ? "info" : "debug",
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  transports: [
    // ============================================
    // 📄 File Transports
    // ============================================

    // ❌ Error logs - only errors
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: customFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // ✅ Combined logs - all levels
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      format: customFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // 📊 Performance logs - only performance related
    new winston.transports.File({
      filename: path.join(logDir, "performance.log"),
      level: "http",
      format: customFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // 🖥️ Console Transport (development)
    new winston.transports.Console({
      format: consoleFormat,
      level: config.isProduction ? "info" : "debug",
    }),
  ],
});

// ============================================
// 🔧 Helper Functions
// ============================================

/**
 * Log info message
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @param {string} requestId - Request ID for tracking
 * @param {string} userId - User ID for tracking
 */
const logInfo = (message, meta = {}, requestId = null, userId = null) => {
  logger.info(message, { ...meta, requestId, userId });
};

/**
 * Log error message
 * @param {string} message - Log message
 * @param {Error|Object} error - Error object or additional metadata
 * @param {string} requestId - Request ID for tracking
 * @param {string} userId - User ID for tracking
 */
const logError = (message, error = {}, requestId = null, userId = null) => {
  if (error instanceof Error) {
    logger.error(message, {
      error: error.message,
      stack: error.stack,
      ...error,
      requestId,
      userId,
    });
  } else {
    logger.error(message, { ...error, requestId, userId });
  }
};

/**
 * Log warning message
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @param {string} requestId - Request ID for tracking
 * @param {string} userId - User ID for tracking
 */
const logWarn = (message, meta = {}, requestId = null, userId = null) => {
  logger.warn(message, { ...meta, requestId, userId });
};

/**
 * Log debug message
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @param {string} requestId - Request ID for tracking
 * @param {string} userId - User ID for tracking
 */
const logDebug = (message, meta = {}, requestId = null, userId = null) => {
  logger.debug(message, { ...meta, requestId, userId });
};

/**
 * Log HTTP/performance message
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @param {string} requestId - Request ID for tracking
 * @param {string} userId - User ID for tracking
 */
const logPerformance = (message, meta = {}, requestId = null, userId = null) => {
  logger.http(message, { ...meta, requestId, userId });
};

/**
 * Create a child logger with context
 * @param {Object} context - Context data (requestId, userId, etc.)
 * @returns {Object} - Child logger with context
 */
const createChildLogger = (context = {}) => {
  return {
    info: (message, meta = {}) => logInfo(message, meta, context.requestId, context.userId),
    error: (message, error = {}) => logError(message, error, context.requestId, context.userId),
    warn: (message, meta = {}) => logWarn(message, meta, context.requestId, context.userId),
    debug: (message, meta = {}) => logDebug(message, meta, context.requestId, context.userId),
    performance: (message, meta = {}) =>
      logPerformance(message, meta, context.requestId, context.userId),
  };
};

// ============================================
// 📤 Export - Single export of all functions
// ============================================

export { logInfo, logError, logWarn, logDebug, logPerformance, createChildLogger };

export default logger;
