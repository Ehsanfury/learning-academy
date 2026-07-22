/**
 * monitoring.js
 * Path: src/utils/monitoring.js
 * Description: Frontend monitoring utilities - DISABLED (no Sentry)
 * Version: 2.0 - Completely disabled to avoid build issues
 * Changes:
 * - ✅ REMOVED: @sentry/react import (causing build failure)
 * - ✅ All functions are stubs
 * - ✅ Console logging for development only
 */

// ============================================
// 📊 Configuration
// ============================================

const isProduction = import.meta.env.PROD || false;

// ============================================
// 🎯 Sentry Lazy Load - DISABLED
// ============================================

// ✅ No Sentry import - completely disabled
const Sentry = null;

// ============================================
// 📊 Web Vitals - DISABLED
// ============================================

const reportWebVitals = () => {
  // Web Vitals reporting is disabled
  // To enable, uncomment the import below and install web-vitals
  // import("web-vitals").then(({ onLCP, onFID, onCLS, onFCP, onTTFB }) => { ... });
};

// ============================================
// 📢 Error Tracking (Stub)
// ============================================

export const trackError = (error, context = {}) => {
  // Always log to console in development
  if (!isProduction) {
    console.error(
      "🔴 [ERROR] Error tracked:",
      error?.message || error,
      context,
    );
  }

  // ✅ No Sentry in production - just log
  if (isProduction) {
    console.error("🔴 [PROD ERROR]:", error?.message || error, context);
  }
};

// ============================================
// 📢 Track Custom Event (Stub)
// ============================================

export const trackEvent = (name, properties = {}) => {
  if (!isProduction) {
    console.log("📊 [EVENT]:", name, properties);
  }
  // ✅ No analytics in production
};

// ============================================
// ⏱️ Performance Marks (Stub)
// ============================================

export const startMark = (name) => {
  if (!isProduction && typeof performance !== "undefined" && performance.mark) {
    performance.mark(`${name}-start`);
  }
};

export const endMark = (name) => {
  if (!isProduction && typeof performance !== "undefined" && performance.mark) {
    try {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      const measures = performance.getEntriesByName(name);
      const duration = measures[measures.length - 1]?.duration;
      if (duration) {
        console.log(`⏱️ [PERF] ${name}: ${duration.toFixed(2)}ms`);
      }
      return duration;
    } catch (e) {
      return null;
    }
  }
  return null;
};

// ============================================
// 👤 Set User Context (Stub)
// ============================================

export const setUserContext = (user) => {
  if (!isProduction) {
    console.log("👤 [USER] Set user context:", user?.email || user?.id);
  }
};

// ============================================
// 📊 Page View Tracking (Stub)
// ============================================

export const trackPageView = (path, title) => {
  const pagePath = path || window.location?.pathname || "/";
  const pageTitle = title || document?.title || "Unknown";

  if (!isProduction) {
    console.log(`📄 [PAGE] ${pagePath} - ${pageTitle}`);
  }
  // ✅ No analytics in production
};

// ============================================
// 🔄 Initialize monitoring
// ============================================

export const initMonitoring = () => {
  if (!isProduction) {
    console.log("🔍 [MONITOR] Monitoring initialized (development mode)");
  } else {
    console.log("🔍 [MONITOR] Monitoring disabled in production");
  }

  // ✅ Global error handlers - just log
  window.addEventListener("error", (event) => {
    console.error("🔴 [GLOBAL ERROR]:", event.error || event.message);
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("🔴 [UNHANDLED REJECTION]:", event.reason);
  });
};

export default {
  trackError,
  trackEvent,
  trackPageView,
  startMark,
  endMark,
  setUserContext,
  initMonitoring,
};
