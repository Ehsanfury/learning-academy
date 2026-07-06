/**
 * errors/index.js
 * Path: backend/errors/index.js
 * Description: Central export for all custom error classes
 * Changes:
 * - ✅ Added AppError export
 * - ✅ All error classes exported from one place
 */

import AppError from "./appError.js";
import ValidationError from "./validationError.js";
import NotFoundError from "./notFoundError.js";
import UnauthorizedError from "./unauthorizedError.js";
import ForbiddenError from "./forbiddenError.js";
import ConflictError from "./conflictError.js";
import RateLimitError from "./rateLimitError.js";

export {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
};

export default {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
};
