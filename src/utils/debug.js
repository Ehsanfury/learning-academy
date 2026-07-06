/**
 * debug.js
 * Path: src/utils/debug.js
 * Description: Debug logging utility
 * Changes:
 * - L29: Replaces console.log with controlled debug logging
 */

const isDevelopment = process.env.NODE_ENV === "development";

export const debug = {
  log: (...args) => {
    if (isDevelopment) {
      console.log("[DEBUG]", ...args);
    }
  },

  info: (...args) => {
    if (isDevelopment) {
      console.info("[INFO]", ...args);
    }
  },

  warn: (...args) => {
    if (isDevelopment) {
      console.warn("[WARN]", ...args);
    }
  },

  error: (...args) => {
    // Always log errors, even in production
    console.error("[ERROR]", ...args);
  },

  // For API requests
  api: (method, url, data = null) => {
    if (isDevelopment) {
      console.log(`📡 API ${method} ${url}`, data || "");
    }
  },

  // For auth events
  auth: (event, data = null) => {
    if (isDevelopment) {
      console.log(`🔐 Auth: ${event}`, data || "");
    }
  },

  // For component lifecycle
  component: (name, event, data = null) => {
    if (isDevelopment) {
      console.log(`🧩 ${name}: ${event}`, data || "");
    }
  },
};

export default debug;
