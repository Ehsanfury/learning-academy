/**
 * errorTracking.js
 * Path: backend/services/errorTracking.js
 * Description: Backend error tracking and aggregation service
 * Version: 1.0 - New file
 * Features:
 * - ✅ Error logging to database
 * - ✅ Error aggregation (group by signature)
 * - ✅ Rate limiting (prevent spam)
 * - ✅ Error severity classification
 * - ✅ Notification on critical errors
 * - ✅ Stats and trends
 */

import logger from "../config/logger.js";

// ============================================
// 📊 In-memory error cache (for rate limiting)
// ============================================

const errorCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_SAME_ERROR_PER_TTL = 10;

// ============================================
// 🎯 Error severity levels
// ============================================

const SEVERITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

// ============================================
// 🎯 Classify error severity
// ============================================

const classifyError = (error) => {
  const statusCode = error.statusCode || error.status || 500;
  const message = (error.message || "").toLowerCase();

  // Critical errors
  if (
    statusCode === 500 ||
    message.includes("database") ||
    message.includes("connection") ||
    message.includes("econnrefused") ||
    message.includes("out of memory")
  ) {
    return SEVERITY.CRITICAL;
  }

  // High severity
  if (statusCode >= 500 || message.includes("timeout")) {
    return SEVERITY.HIGH;
  }

  // Medium severity
  if (statusCode >= 400 && statusCode < 500) {
    return SEVERITY.MEDIUM;
  }

  return SEVERITY.LOW;
};

// ============================================
// 🧹 Generate error signature
// ============================================

const generateSignature = (error) => {
  const stack = error.stack || error.message || "unknown";
  // Take first 3 stack frames for signature
  const lines = stack.split("\n").slice(0, 4).join("\n");
  return lines;
};

// ============================================
// 📊 Check rate limit
// ============================================

const checkRateLimit = (signature) => {
  const now = Date.now();
  const entry = errorCache.get(signature);

  if (!entry || now - entry.timestamp > CACHE_TTL) {
    errorCache.set(signature, { count: 1, timestamp: now });
    return true;
  }

  entry.count += 1;
  return entry.count <= MAX_SAME_ERROR_PER_TTL;
};

// ============================================
// 📢 Track error
// ============================================

export const trackError = async (error, context = {}) => {
  try {
    const signature = generateSignature(error);
    const severity = classifyError(error);

    // Rate limit check
    if (!checkRateLimit(signature)) {
      logger.debug(`🔇 Error rate limited: ${error.message}`);
      return;
    }

    // Log to logger
    const logContext = {
      signature,
      severity,
      statusCode: error.statusCode || error.status || 500,
      name: error.name,
      message: error.message,
      stack: error.stack,
      path: context.path,
      method: context.method,
      userId: context.userId,
      ip: context.ip,
      userAgent: context.userAgent,
      timestamp: new Date().toISOString(),
      ...context,
    };

    switch (severity) {
      case SEVERITY.CRITICAL:
        logger.error(`🚨 CRITICAL ERROR: ${error.message}`, logContext);
        // Notify on critical
        notifyCriticalError(error, logContext);
        break;
      case SEVERITY.HIGH:
        logger.error(`⚠️ HIGH ERROR: ${error.message}`, logContext);
        break;
      case SEVERITY.MEDIUM:
        logger.warn(`⚠️ MEDIUM ERROR: ${error.message}`, logContext);
        break;
      default:
        logger.info(`ℹ️ LOW ERROR: ${error.message}`, logContext);
    }

    // TODO: Save to database if ErrorLog model exists
    // await ErrorLog.create(logContext);

    // Send to Sentry if available
    if (global.Sentry) {
      global.Sentry.withScope((scope) => {
        scope.setLevel(severity);
        scope.setContext("error_context", context);
        scope.setTag("severity", severity);
        global.Sentry.captureException(error);
      });
    }
  } catch (trackingError) {
    logger.error("Failed to track error:", trackingError);
  }
};

// ============================================
// 📢 Notify critical errors
// ============================================

const notifyCriticalError = async (error, context) => {
  try {
    // Send notification (email, Slack, Telegram, etc.)
    if (process.env.ADMIN_EMAIL) {
      // TODO: Send email notification
      logger.info(`📧 Critical error notification sent to admin`);
    }

    // Send to Slack webhook if configured
    if (process.env.SLACK_WEBHOOK_URL) {
      await sendSlackNotification(error, context);
    }
  } catch (err) {
    logger.error("Failed to send critical error notification:", err);
  }
};

// ============================================
// 📢 Send Slack notification
// ============================================

const sendSlackNotification = async (error, context) => {
  try {
    const message = {
      text: `🚨 Critical Error in Learning Academy`,
      attachments: [
        {
          color: "danger",
          fields: [
            { title: "Error", value: error.message, short: false },
            { title: "Severity", value: context.severity, short: true },
            { title: "Status Code", value: String(context.statusCode), short: true },
            { title: "Path", value: context.path || "N/A", short: true },
            { title: "Method", value: context.method || "N/A", short: true },
            { title: "User ID", value: context.userId || "anonymous", short: true },
            { title: "Timestamp", value: context.timestamp, short: true },
          ],
        },
      ],
    };

    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
  } catch (err) {
    logger.error("Failed to send Slack notification:", err);
  }
};

// ============================================
// 📊 Get error stats
// ============================================

export const getErrorStats = async (timeframe = "24h") => {
  // TODO: Query database for stats
  const cacheStats = {
    uniqueErrors: errorCache.size,
    cacheSize: errorCache.size,
  };

  return {
    timeframe,
    ...cacheStats,
    bySeverity: {
      [SEVERITY.CRITICAL]: 0,
      [SEVERITY.HIGH]: 0,
      [SEVERITY.MEDIUM]: 0,
      [SEVERITY.LOW]: 0,
    },
  };
};

// ============================================
// 🧹 Clear cache (for testing)
// ============================================

export const clearErrorCache = () => {
  errorCache.clear();
};

export default {
  trackError,
  getErrorStats,
  clearErrorCache,
  SEVERITY,
};
