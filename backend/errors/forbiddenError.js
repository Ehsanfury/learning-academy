/**
 * forbiddenError.js
 * Path: backend/errors/forbiddenError.js
 * Description: Forbidden error class
 */

import AppError from "./appError.js";

class ForbiddenError extends AppError {
  constructor({ message = "Forbidden", statusCode = 403 } = {}) {
    super(message, statusCode);
    this.name = "ForbiddenError";
  }
}

export default ForbiddenError;
