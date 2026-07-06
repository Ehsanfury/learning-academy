/**
 * progress.validator.js
 * Path: backend/validators/progress.validator.js
 * Description: Validation for progress
 * Changes:
 * - Standardized error format
 * - Added detailed error messages
 * - Added validateProgressId
 */

const VALID_STATUSES = ["not_started", "in_progress", "completed", "perfect"];

/**
 * Validate user ID
 * @param {string} userId - User ID
 * @returns {Object} - { valid, errors }
 */
export const validateUserId = (userId) => {
  const errors = [];

  if (!userId) {
    errors.push({ field: "userId", message: "User ID is required" });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate lesson ID
 * @param {string} lessonId - Lesson ID
 * @returns {Object} - { valid, errors }
 */
export const validateLessonId = (lessonId) => {
  const errors = [];

  if (!lessonId) {
    errors.push({ field: "lessonId", message: "Lesson ID is required" });
  } else if (typeof lessonId !== "string" || lessonId.trim() === "") {
    errors.push({ field: "lessonId", message: "Lesson ID must be a non-empty string" });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate progress status
 * @param {string} status - Progress status
 * @returns {Object} - { valid, errors }
 */
export const validateStatus = (status) => {
  const errors = [];

  if (!status) {
    errors.push({ field: "status", message: "Status is required" });
  } else if (!VALID_STATUSES.includes(status)) {
    errors.push({
      field: "status",
      message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate score
 * @param {number} score - Score
 * @returns {Object} - { valid, errors, data }
 */
export const validateScore = (score) => {
  const errors = [];
  const numericScore = Number(score);

  if (score === undefined || score === null || isNaN(numericScore)) {
    errors.push({ field: "score", message: "Score is required and must be a number" });
  } else if (numericScore < 0 || numericScore > 100) {
    errors.push({ field: "score", message: "Score must be between 0 and 100" });
  }

  return {
    valid: errors.length === 0,
    errors,
    data: numericScore,
  };
};

/**
 * Validate progress ID
 * @param {string} id - Progress ID
 * @returns {Object} - { valid, errors }
 */
export const validateProgressId = (id) => {
  const errors = [];

  if (!id) {
    errors.push({ field: "id", message: "Progress ID is required" });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate update progress data
 * @param {Object} body - Request body
 * @returns {Object} - { valid, errors, data }
 */
export const validateUpdateProgress = (body) => {
  const { lessonId, status, score, answers, xpEarned, completedAt } = body;
  const errors = [];

  // Validate lesson ID
  const lessonValidation = validateLessonId(lessonId);
  if (!lessonValidation.valid) {
    errors.push(...lessonValidation.errors);
  }

  // Validate status (optional)
  if (status) {
    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      errors.push(...statusValidation.errors);
    }
  }

  // Validate score (optional)
  if (score !== undefined) {
    const scoreValidation = validateScore(score);
    if (!scoreValidation.valid) {
      errors.push(...scoreValidation.errors);
    }
  }

  // Validate answers (must be object)
  if (answers !== undefined && answers !== null && typeof answers !== "object") {
    errors.push({ field: "answers", message: "Answers must be an object" });
  }

  // Validate xpEarned (optional)
  if (xpEarned !== undefined) {
    const numXp = Number(xpEarned);
    if (isNaN(numXp) || numXp < 0) {
      errors.push({ field: "xpEarned", message: "XP earned must be a positive number" });
    }
  }

  // Validate completedAt (optional)
  if (completedAt !== undefined && completedAt !== null) {
    const date = new Date(completedAt);
    if (isNaN(date.getTime())) {
      errors.push({ field: "completedAt", message: "Invalid date format" });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      lessonId: lessonId?.trim(),
      status: status || "in_progress",
      score: score !== undefined ? Number(score) : 0,
      answers: answers || {},
      xpEarned: xpEarned !== undefined ? Number(xpEarned) : 0,
      completedAt: completedAt || null,
    },
  };
};

export default {
  validateUserId,
  validateLessonId,
  validateStatus,
  validateScore,
  validateProgressId,
  validateUpdateProgress,
  VALID_STATUSES,
};
