/**
 * notFoundError.js
 * Path: backend/errors/notFoundError.js
 * Description: Not found error class
 */

import AppError from "./appError.js";

class NotFoundError extends AppError {
  constructor({ message = "Resource not found", resource = null, statusCode = 404 } = {}) {
    super(message, statusCode, resource);
    this.name = "NotFoundError";
    this.resource = resource;
  }
}

export default NotFoundError;
