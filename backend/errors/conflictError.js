/**
 * conflictError.js
 * Path: backend/errors/conflictError.js
 * Description: Conflict error class
 */

import AppError from "./appError.js";

class ConflictError extends AppError {
  constructor({ message = "Conflict", statusCode = 409 } = {}) {
    super(message, statusCode);
    this.name = "ConflictError";
  }
}

export default ConflictError;
