/**
 * exercise.validator.js
 * Path: backend/validators/exercise.validator.js
 * Description: Validation for exercise requests
 */

const VALID_TYPES = ["vocabulary", "grammar", "listening", "reading", "writing", "mixed"];
const VALID_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

/**
 * Validate exercise generation request
 * @param {Object} body - Request body
 * @returns {Object} - { valid, errors, data }
 */
export const validateExerciseRequest = (body) => {
  const { type, level, count = 5, options = {} } = body;
  const errors = [];

  // Validate type
  if (!type) {
    errors.push({ field: "type", message: "Exercise type is required" });
  } else if (!VALID_TYPES.includes(type)) {
    errors.push({
      field: "type",
      message: `Type must be one of: ${VALID_TYPES.join(", ")}`,
    });
  }

  // Validate level
  if (!level) {
    errors.push({ field: "level", message: "Level is required" });
  } else if (!VALID_LEVELS.includes(level.toUpperCase())) {
    errors.push({
      field: "level",
      message: `Level must be one of: ${VALID_LEVELS.join(", ")}`,
    });
  }

  // Validate count
  if (count !== undefined) {
    const numCount = Number(count);
    if (isNaN(numCount) || numCount < 1 || numCount > 20) {
      errors.push({
        field: "count",
        message: "Count must be between 1 and 20",
      });
    }
  }

  // Validate options (optional)
  if (options && typeof options !== "object") {
    errors.push({
      field: "options",
      message: "Options must be an object",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      type,
      level: level?.toUpperCase(),
      count: Number(count),
      options: options || {},
    },
  };
};

/**
 * Validate exercise submit request
 * @param {Object} body - Request body
 * @returns {Object} - { valid, errors, data }
 */
export const validateExerciseSubmit = (body) => {
  const { questions, answers } = body;
  const errors = [];

  if (!questions) {
    errors.push({ field: "questions", message: "Questions are required" });
  } else if (!Array.isArray(questions) || questions.length === 0) {
    errors.push({
      field: "questions",
      message: "Questions must be a non-empty array",
    });
  }

  if (!answers) {
    errors.push({ field: "answers", message: "Answers are required" });
  } else if (typeof answers !== "object") {
    errors.push({
      field: "answers",
      message: "Answers must be an object",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      questions,
      answers,
    },
  };
};

export default {
  validateExerciseRequest,
  validateExerciseSubmit,
  VALID_TYPES,
  VALID_LEVELS,
};
