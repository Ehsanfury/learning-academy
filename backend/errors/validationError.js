/**
 * validationError.js
 * Path: backend/errors/validationError.js
 * Description: Validation error class
 */

import AppError from "./appError.js";

class ValidationError extends AppError {
  constructor({ message = "Validation failed", details = null, statusCode = 400 } = {}) {
    super(message, statusCode, details);
    this.name = "ValidationError";
  }
}

export default ValidationError;
