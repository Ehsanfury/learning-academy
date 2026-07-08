/**
 * activityMiddleware.js
 * Path: backend/middlewares/activityMiddleware.js
 * Description: Activity tracking middleware
 * Changes:
 * - ✅ FIXED: Proper error handling
 * - ✅ FIXED: Non-blocking activity tracking using setImmediate
 */

import streakService from "../services/streakService.js";
import logger from "../config/logger.js";

/**
 * Track user activity middleware
 * ✅ FIXED: Non-blocking, proper error handling
 */
export const trackActivity = async (req, res, next) => {
  // Skip if no user (public routes)
  if (!req.user) {
    return next();
  }

  // Track activity asynchronously - never block the request
  setImmediate(async () => {
    try {
      await streakService.logDailyActivity(req.user.id, "api_activity");
    } catch (error) {
      // Log error but don't break the request
      logger.error("❌ Failed to track activity:", {
        userId: req.user.id,
        error: error.message,
        path: req.path,
        method: req.method,
      });
    }
  });

  next();
};

export default { trackActivity };
