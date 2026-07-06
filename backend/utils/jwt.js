/**
 * jwt.js
 * Path: backend/utils/jwt.js
 * Description: JWT utilities
 * Changes:
 * - ✅ verifyAccessToken now throws proper errors
 * - ✅ Added error types for different failure reasons
 */

import jwt from "jsonwebtoken";
import config from "../config/env.js";
import { UnauthorizedError } from "../errors/index.js";

const JWT_SECRET = config.jwt.accessSecret;

/**
 * Verify access token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 * @throws {UnauthorizedError} If token is invalid or expired
 */
export const verifyAccessToken = (token) => {
  if (!token) {
    throw new UnauthorizedError("No token provided");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    // Check error type for specific messages
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new UnauthorizedError("Invalid token");
    }
    throw new UnauthorizedError("Token verification failed");
  }
};

/**
 * Generate access token
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Expiration time
 * @returns {string} JWT token
 */
export const generateAccessToken = (payload, expiresIn = "15m") => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Decode token without verification
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};
