/**
 * authMiddleware.js
 * Path: backend/middlewares/authMiddleware.js
 * Description: Authentication middleware
 * Changes:
 * - ✅ Fixed 401 errors being returned as 500
 * - ✅ Proper error handling for expired/invalid tokens
 * - ✅ Removed error message leakage
 */

import { verifyAccessToken } from "../utils/jwt.js";
import { User } from "../models/index.js";
import { UnauthorizedError } from "../errors/index.js";
import logger from "../config/logger.js";

/**
 * Authenticate middleware
 * ✅ FIXED: Returns 401 for token errors, not 500
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Verify token (throws UnauthorizedError on failure)
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      // ✅ FIXED: Return 401 for token errors
      return res.status(401).json({
        success: false,
        message: error.message || "Invalid token",
      });
    }

    // Get user from database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password", "refreshToken"] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account deactivated",
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    // ✅ FIXED: Catch-all returns 401 for auth errors, not 500
    logger.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

/**
 * Optional authentication
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = verifyAccessToken(token);
        const user = await User.findByPk(decoded.id);
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (e) {
        // Ignore token errors for optional auth
      }
    }
    next();
  } catch (error) {
    next();
  }
};

/**
 * Authorize middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

export default {
  authenticate,
  optionalAuth,
  authorize,
};
