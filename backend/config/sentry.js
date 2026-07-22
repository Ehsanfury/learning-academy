/**
 * sentry.js
 * Path: backend/config/sentry.js
 * Description: Sentry configuration for backend error tracking
 * Version: 1.0 - New file
 * Features:
 * - ✅ Sentry init with environment-aware config
 * - ✅ Request profiling (performance monitoring)
 * - ✅ User context
 * - ✅ Request context (URL, method, headers)
 * - ✅ BeforeSend filter (PII removal)
 * - ✅ Release tracking
 * - ✅ Sample rate config
 */

import Sentry from "@sentry/node";
import config from "./env.js";

// ============================================
// 🎯 PII Fields to scrub
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
  "email",
  "phone",
];

// ============================================
// 🧹 Scrub sensitive data
// ============================================

const scrubSensitiveData = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(scrubSensitiveData);

  const scrubbed = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
      scrubbed[key] = "[REDACTED]";
    } else if (typeof value === "object") {
      scrubbed[key] = scrubSensitiveData(value);
    } else {
      scrubbed[key] = value;
    }
  }
  return scrubbed;
};

// ============================================
// 🚀 Initialize Sentry
// ============================================

export const initSentry = () => {
  if (!config.sentry?.dsn || process.env.NODE_ENV !== "production") {
    console.log("ℹ️ Sentry disabled in development or missing DSN");
    return null;
  }

  Sentry.init({
    dsn: config.sentry.dsn,
    environment: process.env.NODE_ENV || "development",
    release: process.env.APP_VERSION || "learning-academy@2.0.0",

    // Performance monitoring
    tracesSampleRate: config.sentry.tracesSampleRate || 0.1,
    profilesSampleRate: config.sentry.profilesSampleRate || 0.1,

    // Filter events before sending
    beforeSend(event) {
      // Scrub request body
      if (event.request?.data) {
        event.request.data = scrubSensitiveData(event.request.data);
      }

      // Scrub extra data
      if (event.extra) {
        event.extra = scrubSensitiveData(event.extra);
      }

      // Don't send events in tests
      if (process.env.NODE_ENV === "test") {
        return null;
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Common browser errors
      "TypeError: Network request failed",
      "Error: Network Error",
      // Cancelled requests
      "CancelError",
      // Rate limit errors (not actionable)
      "RateLimitError",
    ],

    // Integrations
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: null }),
    ],
  });

  console.log("✅ Sentry initialized");
  return Sentry;
};

// ============================================
// 👤 Set user context
// ============================================

export const setSentryUser = (user) => {
  if (!user) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username || user.name,
    role: user.role,
  });
};

// ============================================
// 🏷️ Set tag
// ============================================

export const setSentryTag = (key, value) => {
  Sentry.setTag(key, value);
};

// ============================================
// 📝 Set context
// ============================================

export const setSentryContext = (name, context) => {
  Sentry.setContext(name, context);
};

// ============================================
// 📢 Capture error
// ============================================

export const captureError = (error, context = {}) => {
  if (context.extra) {
    Sentry.setContext("extra", scrubSensitiveData(context.extra));
  }
  if (context.tags) {
    Object.entries(context.tags).forEach(([key, value]) => {
      Sentry.setTag(key, value);
    });
  }
  if (context.level) {
    Sentry.withScope((scope) => {
      scope.setLevel(context.level);
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
};

// ============================================
// 📢 Capture message
// ============================================

export const captureMessage = (message, level = "info") => {
  Sentry.captureMessage(message, level);
};

// ============================================
// 🧹 Clear user on logout
// ============================================

export const clearSentryUser = () => {
  Sentry.setUser(null);
};

export default Sentry;
