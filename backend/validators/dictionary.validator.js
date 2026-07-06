/**
 * dictionary.validator.js
 * Path: backend/validators/dictionary.validator.js
 * Description: Validation for dictionary endpoints
 */

/**
 * Validate search query
 */
export const validateSearch = (query) => {
  const { q, level, category, limit, offset } = query;
  const errors = [];

  if (!q) {
    errors.push({ field: "q", message: "Search query is required" });
  } else if (typeof q !== "string" || q.trim().length < 2) {
    errors.push({ field: "q", message: "Search query must be at least 2 characters" });
  }

  if (level) {
    const validLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    if (!validLevels.includes(level.toUpperCase())) {
      errors.push({
        field: "level",
        message: `Level must be one of: ${validLevels.join(", ")}`,
      });
    }
  }

  if (category && typeof category !== "string") {
    errors.push({ field: "category", message: "Category must be a string" });
  }

  if (limit) {
    const numLimit = Number(limit);
    if (isNaN(numLimit) || numLimit < 1 || numLimit > 200) {
      errors.push({ field: "limit", message: "Limit must be between 1 and 200" });
    }
  }

  if (offset) {
    const numOffset = Number(offset);
    if (isNaN(numOffset) || numOffset < 0) {
      errors.push({ field: "offset", message: "Offset must be a non-negative number" });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      q: q.trim(),
      level: level?.toUpperCase(),
      category,
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0,
    },
  };
};

/**
 * Validate save word
 */
export const validateSaveWord = (params) => {
  const { wordId } = params;
  const errors = [];

  if (!wordId) {
    errors.push({ field: "wordId", message: "Word ID is required" });
  } else if (typeof wordId !== "string" || wordId.trim().length < 1) {
    errors.push({ field: "wordId", message: "Word ID must be a non-empty string" });
  }

  return {
    valid: errors.length === 0,
    errors,
    data: { wordId: wordId.trim() },
  };
};

export default {
  validateSearch,
  validateSaveWord,
};
