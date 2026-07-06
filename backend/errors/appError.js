/**
 * appError.js
 * Path: backend/errors/appError.js
 * Description: Base custom error class
 * Changes:
 * - ✅ Added default export
 * - ✅ Extended Error class properly
 */

class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
