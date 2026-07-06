/**
 * activityMiddleware.js
 * Path: backend/middlewares/activityMiddleware.js
 * Description: Activity tracking middleware
 * Changes:
 * - ✅ Fixed unhandled promise rejection
 * - ✅ Proper error handling with try/catch inside async
 */

import streakService from "../services/streakService.js";
import logger from "../config/logger.js";

/**
 * Track user activity middleware
 * ✅ FIXED: Proper error handling for async operations
 */
export const trackActivity = async (req, res, next) => {
  // Skip if no user (public routes)
  if (!req.user) {
    return next();
  }

  try {
    // Track activity asynchronously with proper error handling
    // ✅ FIXED: try/catch is inside the async function
    await (async () => {
      try {
        await streakService.logDailyActivity(req.user.id, "api_activity");
      } catch (error) {
        // Log error but don't break the request
        logger.error("❌ Failed to track activity:", {
          userId: req.user.id,
          error: error.message,
          path: req.path,
        });
      }
    })();
  } catch (error) {
    // If the async wrapper itself fails, just log it
    logger.error("❌ Activity tracking wrapper error:", {
      userId: req.user?.id,
      error: error.message,
    });
  }

  next();
};

export default { trackActivity };
