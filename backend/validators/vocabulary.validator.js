/**
 * vocabulary.validator.js
 * Path: backend/validators/vocabulary.validator.js
 * Description: Validation for vocabulary endpoints
 * Changes:
 * - Added all missing exports: validateGetWords, validateSearch, validateSaveWord
 * - Fixed all exports
 */

/**
 * Validate vocabulary review
 */
export const validateVocabularyReview = (body) => {
  const { quality } = body;
  const errors = [];

  if (quality === undefined || quality === null) {
    errors.push({ field: "quality", message: "Quality is required" });
  } else if (isNaN(Number(quality)) || Number(quality) < 0 || Number(quality) > 5) {
    errors.push({ field: "quality", message: "Quality must be between 0 and 5" });
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      quality: Number(quality),
    },
  };
};

/**
 * ✅ Validate get words query
 */
export const validateGetWords = (query) => {
  const { level, category, limit } = query;
  const errors = [];

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

  return {
    valid: errors.length === 0,
    errors,
    data: {
      level: level?.toUpperCase(),
      category,
      limit: limit ? Number(limit) : 50,
    },
  };
};

/**
 * ✅ Validate search query (for dictionary search)
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
 * ✅ Validate save word (for saving words to user list)
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

/**
 * ✅ Validate remove word
 */
export const validateRemoveWord = (params) => {
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
  validateVocabularyReview,
  validateGetWords,
  validateSearch,
  validateSaveWord,
  validateRemoveWord,
};
