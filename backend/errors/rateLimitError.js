/**
 * rateLimitError.js
 * Path: backend/errors/rateLimitError.js
 * Description: Rate limit error class
 */

import AppError from "./appError.js";

class RateLimitError extends AppError {
  constructor({ message = "Too many requests, please try again later", statusCode = 429 } = {}) {
    super(message, statusCode);
    this.name = "RateLimitError";
  }
}

export default RateLimitError;
