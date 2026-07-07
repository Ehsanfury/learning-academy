/**
 * logger.js
 * Path: backend/config/logger.js
 * Description: Winston logger configuration
 * Changes:
 * - ✅ FIXED: Removed dependency on config (to avoid circular reference)
 * - ✅ FIXED: Using process.env directly
 * - ✅ FIXED: Removed duplicate exports
 */

import winston from "winston";
import path from "path";
import fs from "fs";

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
// 📊 Create Logger - Using env variables directly
// ============================================

const isProduction = process.env.NODE_ENV === "production";
const logLevel = isProduction ? "info" : "debug";

const logger = winston.createLogger({
  level: logLevel,
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  transports: [
    // ❌ Error logs - only errors
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: customFormat,
      maxsize: 5242880,
      maxFiles: 5,
    }),

    // ✅ Combined logs - all levels
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      format: customFormat,
      maxsize: 5242880,
      maxFiles: 5,
    }),

    // 📊 Performance logs
    new winston.transports.File({
      filename: path.join(logDir, "performance.log"),
      level: "http",
      format: customFormat,
      maxsize: 5242880,
      maxFiles: 5,
    }),

    // 🖥️ Console Transport
    new winston.transports.Console({
      format: consoleFormat,
      level: logLevel,
    }),
  ],
});

// ============================================
// 🔧 Helper Functions
// ============================================

export const logInfo = (message, meta = {}, requestId = null, userId = null) => {
  logger.info(message, { ...meta, requestId, userId });
};

export const logError = (message, error = {}, requestId = null, userId = null) => {
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

export const logWarn = (message, meta = {}, requestId = null, userId = null) => {
  logger.warn(message, { ...meta, requestId, userId });
};

export const logDebug = (message, meta = {}, requestId = null, userId = null) => {
  logger.debug(message, { ...meta, requestId, userId });
};

export const logPerformance = (message, meta = {}, requestId = null, userId = null) => {
  logger.http(message, { ...meta, requestId, userId });
};

export const createChildLogger = (context = {}) => {
  return {
    info: (message, meta = {}) => logInfo(message, meta, context.requestId, context.userId),
    error: (message, error = {}) => logError(message, error, context.requestId, context.userId),
    warn: (message, meta = {}) => logWarn(message, meta, context.requestId, context.userId),
    debug: (message, meta = {}) => logDebug(message, meta, context.requestId, context.userId),
    performance: (message, meta = {}) =>
      logPerformance(message, meta, context.requestId, context.userId),
  };
};

export default logger;
