/**
 * lesson.validator.js
 * Path: backend/validators/lesson.validator.js
 * Description: Lesson validation schemas
 * Changes:
 * - ✅ Added validateLessonCompletion export
 * - ✅ Added validateLessonId export
 * - ✅ Added validateGetLessons export
 */

/**
 * Validate lesson completion data
 * @param {Object} data - Lesson completion data
 * @returns {Object} Validated data
 * @throws {ValidationError} If validation fails
 */
export const validateLessonCompletion = (data) => {
  const { score, answers, timeSpent } = data;

  // Validate score
  if (score === undefined || score === null) {
    throw new ValidationError({
      message: "Score is required",
      details: [{ field: "score", message: "Score is required" }],
    });
  }

  if (typeof score !== "number" || score < 0 || score > 100) {
    throw new ValidationError({
      message: "Score must be between 0 and 100",
      details: [{ field: "score", message: "Score must be between 0 and 100" }],
    });
  }

  // Validate answers
  if (!answers || typeof answers !== "object") {
    throw new ValidationError({
      message: "Answers are required",
      details: [{ field: "answers", message: "Answers are required" }],
    });
  }

  // Validate timeSpent (optional)
  if (timeSpent !== undefined && (typeof timeSpent !== "number" || timeSpent < 0)) {
    throw new ValidationError({
      message: "Time spent must be a positive number",
      details: [{ field: "timeSpent", message: "Time spent must be a positive number" }],
    });
  }

  return {
    score,
    answers,
    timeSpent: timeSpent || 0,
  };
};

/**
 * Validate lesson ID
 * @param {string} id - Lesson ID
 * @returns {Object} Validated data
 * @throws {ValidationError} If validation fails
 */
export const validateLessonId = (id) => {
  if (!id) {
    throw new ValidationError({
      message: "Lesson ID is required",
      details: [{ field: "id", message: "Lesson ID is required" }],
    });
  }

  if (typeof id !== "string" || id.trim().length === 0) {
    throw new ValidationError({
      message: "Invalid lesson ID",
      details: [{ field: "id", message: "Lesson ID must be a non-empty string" }],
    });
  }

  return { id: id.trim() };
};

/**
 * Validate get lessons query parameters
 * @param {Object} query - Query parameters
 * @returns {Object} Validated data
 */
export const validateGetLessons = (query) => {
  const { level, search, limit, offset } = query;

  const result = {};

  // Validate level (optional)
  if (level) {
    const validLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    if (!validLevels.includes(level.toUpperCase())) {
      throw new ValidationError({
        message: "Invalid level",
        details: [{ field: "level", message: "Level must be A1, A2, B1, B2, C1, or C2" }],
      });
    }
    result.level = level.toUpperCase();
  }

  // Validate search (optional)
  if (search) {
    if (typeof search !== "string" || search.trim().length < 2) {
      throw new ValidationError({
        message: "Search query must be at least 2 characters",
        details: [{ field: "search", message: "Search query must be at least 2 characters" }],
      });
    }
    result.search = search.trim();
  }

  // Validate limit (optional)
  if (limit) {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new ValidationError({
        message: "Limit must be between 1 and 100",
        details: [{ field: "limit", message: "Limit must be between 1 and 100" }],
      });
    }
    result.limit = limitNum;
  } else {
    result.limit = 50;
  }

  // Validate offset (optional)
  if (offset) {
    const offsetNum = parseInt(offset, 10);
    if (isNaN(offsetNum) || offsetNum < 0) {
      throw new ValidationError({
        message: "Offset must be a positive number",
        details: [{ field: "offset", message: "Offset must be a positive number" }],
      });
    }
    result.offset = offsetNum;
  } else {
    result.offset = 0;
  }

  return result;
};

/**
 * Validate lesson progress update
 * @param {Object} data - Progress data
 * @returns {Object} Validated data
 */
export const validateProgressUpdate = (data) => {
  const { status, progress, score } = data;

  // Validate status
  if (!status) {
    throw new ValidationError({
      message: "Status is required",
      details: [{ field: "status", message: "Status is required" }],
    });
  }

  const validStatuses = ["not_started", "in_progress", "completed", "perfect"];
  if (!validStatuses.includes(status)) {
    throw new ValidationError({
      message: "Invalid status",
      details: [{ field: "status", message: "Status must be one of: " + validStatuses.join(", ") }],
    });
  }

  const result = { status };

  // Validate progress (optional)
  if (progress !== undefined) {
    const progressNum = parseInt(progress, 10);
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      throw new ValidationError({
        message: "Progress must be between 0 and 100",
        details: [{ field: "progress", message: "Progress must be between 0 and 100" }],
      });
    }
    result.progress = progressNum;
  }

  // Validate score (optional)
  if (score !== undefined) {
    const scoreNum = parseInt(score, 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      throw new ValidationError({
        message: "Score must be between 0 and 100",
        details: [{ field: "score", message: "Score must be between 0 and 100" }],
      });
    }
    result.score = scoreNum;
  }

  return result;
};

// ============================================
// 📤 Export - Default export for backward compatibility
// ============================================

export default {
  validateLessonCompletion,
  validateLessonId,
  validateGetLessons,
  validateProgressUpdate,
};
