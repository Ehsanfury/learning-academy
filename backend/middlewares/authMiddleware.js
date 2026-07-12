/**
 * authMiddleware.js
 * Path: backend/middlewares/authMiddleware.js
 * Description: Authentication middleware
 * Changes:
 * - ✅ FIXED: Using jwt directly instead of verifyAccessToken
 * - ✅ Fixed 401 errors being returned as 500
 * - ✅ Proper error handling for expired/invalid tokens
 */

import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { UnauthorizedError } from "../errors/index.js";
import logger from "../config/logger.js";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new UnauthorizedError("Invalid token");
    }
    throw new UnauthorizedError("Authentication failed");
  }
};

/**
 * Authenticate middleware
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || "Invalid token",
      });
    }

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

    req.user = user;
    next();
  } catch (error) {
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
 * @param {...string} roles - Allowed roles
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
