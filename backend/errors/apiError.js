/**
 * apiError.js
 * Path: backend/errors/apiError.js
 * Description: Base error class for all API errors
 */

class ApiError extends Error {
  constructor({
    message,
    statusCode = 500,
    code = "INTERNAL_SERVER_ERROR",
    details = null,
    isOperational = true,
  }) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    // For better stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON for API response
   */
  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
        ...(process.env.NODE_ENV === "development" && { stack: this.stack }),
        timestamp: this.timestamp,
      },
    };
  }

  /**
   * Should this error be shown to the user?
   */
  shouldReportToUser() {
    return this.isOperational && this.statusCode < 500;
  }

  /**
   * Should this error be logged?
   */
  shouldLog() {
    return this.statusCode >= 400;
  }
}

export default ApiError;
