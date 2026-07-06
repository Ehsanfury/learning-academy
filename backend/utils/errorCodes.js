/**
 * errorCodes.js
 * German Academy
 Unified error codes
 */

export const ErrorCodes = {
  // Auth Errors (1000-1099)
  AUTH_001: {
    code: "AUTH_001",
    message: "Authentication required",
    status: 401,
  },
  AUTH_002: {
    code: "AUTH_002",
    message: "Invalid or expired token",
    status: 401,
  },
  AUTH_003: { code: "AUTH_003", message: "Invalid credentials", status: 401 },
  AUTH_004: {
    code: "AUTH_004",
    message: "Refresh token required",
    status: 401,
  },
  AUTH_005: { code: "AUTH_005", message: "Invalid refresh token", status: 401 },
  AUTH_006: {
    code: "AUTH_006",
    message: "Account is deactivated",
    status: 403,
  },
  AUTH_007: { code: "AUTH_007", message: "Email already exists", status: 409 },
  AUTH_008: { code: "AUTH_008", message: "Invalid reset token", status: 400 },
  AUTH_009: {
    code: "AUTH_009",
    message: "Password must be at least 8 characters",
    status: 400,
  },
  AUTH_010: { code: "AUTH_010", message: "Invalid email format", status: 400 },

  // User Errors (1100-1199)
  USER_001: { code: "USER_001", message: "User not found", status: 404 },
  USER_002: {
    code: "USER_002",
    message: "Invalid current password",
    status: 400,
  },
  USER_003: {
    code: "USER_003",
    message: "Name must be at least 2 characters",
    status: 400,
  },
  USER_004: {
    code: "USER_004",
    message: "Invalid native language",
    status: 400,
  },
  USER_005: { code: "USER_005", message: "Invalid learning goal", status: 400 },
  USER_006: {
    code: "USER_006",
    message: "Daily goal must be between 1 and 1000",
    status: 400,
  },

  // Lesson Errors (1200-1299)
  LESSON_001: { code: "LESSON_001", message: "Lesson not found", status: 404 },
  LESSON_002: { code: "LESSON_002", message: "Lesson is locked", status: 403 },
  LESSON_003: { code: "LESSON_003", message: "Invalid lesson ID", status: 400 },
  LESSON_004: { code: "LESSON_004", message: "Invalid level", status: 400 },
  LESSON_005: {
    code: "LESSON_005",
    message: "Score must be between 0 and 100",
    status: 400,
  },
  LESSON_006: {
    code: "LESSON_006",
    message: "Current lesson not found",
    status: 404,
  },
  LESSON_007: {
    code: "LESSON_007",
    message: "XP amount must be positive",
    status: 400,
  },

  // Progress Errors (1300-1399)
  PROGRESS_001: {
    code: "PROGRESS_001",
    message: "Progress not found",
    status: 404,
  },
  PROGRESS_002: {
    code: "PROGRESS_002",
    message: "Invalid status",
    status: 400,
  },
  PROGRESS_003: { code: "PROGRESS_003", message: "Invalid score", status: 400 },

  // AI Errors (1400-1499)
  AI_001: {
    code: "AI_001",
    message: "Failed to generate AI response",
    status: 503,
  },
  AI_002: { code: "AI_002", message: "Invalid AI provider", status: 400 },
  AI_003: { code: "AI_003", message: "AI API key not configured", status: 503 },

  // Validation Errors (1500-1599)
  VALIDATION_001: {
    code: "VALIDATION_001",
    message: "Validation failed",
    status: 400,
  },
  VALIDATION_002: {
    code: "VALIDATION_002",
    message: "Invalid request body",
    status: 400,
  },

  // Server Errors (5000-5099)
  SERVER_001: {
    code: "SERVER_001",
    message: "Internal server error",
    status: 500,
  },
  SERVER_002: { code: "SERVER_002", message: "Database error", status: 500 },
  SERVER_003: {
    code: "SERVER_003",
    message: "Service unavailable",
    status: 503,
  },
};

/**
// TODO: Translate - TODO: Translate - * پیدا کردن کد خطا بر اساس پیام
 */
export const findErrorCode = (message) => {
  for (const [key, value] of Object.entries(ErrorCodes)) {
    if (value.message === message) {
      return value;
    }
  }
  return ErrorCodes.SERVER_001;
};

/**
// TODO: Translate - TODO: Translate - * ایجاد خطا با کد مشخص
 */
export const createError = (code, customMessage = null) => {
  const error = ErrorCodes[code];
  if (!error) {
    return new Error("Unknown error");
  }
  const err = new Error(customMessage || error.message);
  err.code = error.code;
  err.statusCode = error.status;
  return err;
};

export default ErrorCodes;
