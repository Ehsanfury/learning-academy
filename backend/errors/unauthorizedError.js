/**
 * unauthorizedError.js
 * Path: backend/errors/unauthorizedError.js
 * Description: Unauthorized error class
 */

import AppError from "./appError.js";

class UnauthorizedError extends AppError {
  constructor({ message = "Unauthorized", statusCode = 401 } = {}) {
    super(message, statusCode);
    this.name = "UnauthorizedError";
  }
}

export default UnauthorizedError;
