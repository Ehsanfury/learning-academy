/**
 * ai.validator.js
 * Path: backend/validators/ai.validator.js
 * Description: Validation for AI endpoints
 */

/**
 * Validate chat request
 */
export const validateChat = (body) => {
  const { message, level, sessionId, context } = body;
  const errors = [];

  if (!message) {
    errors.push({ field: "message", message: "Message is required" });
  } else if (typeof message !== "string" || message.trim().length < 1) {
    errors.push({ field: "message", message: "Message must be a non-empty string" });
  } else if (message.length > 10000) {
    errors.push({ field: "message", message: "Message must be less than 10000 characters" });
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

  if (sessionId && typeof sessionId !== "string") {
    errors.push({ field: "sessionId", message: "Session ID must be a string" });
  }

  if (context && typeof context !== "object") {
    errors.push({ field: "context", message: "Context must be an object" });
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      message: message.trim(),
      level: level?.toUpperCase() || "A1",
      sessionId: sessionId || "default",
      context: context || {},
    },
  };
};

/**
 * Validate grammar correction
 */
export const validateGrammarCorrection = (body) => {
  const { text, level } = body;
  const errors = [];

  if (!text) {
    errors.push({ field: "text", message: "Text is required" });
  } else if (typeof text !== "string" || text.trim().length < 1) {
    errors.push({ field: "text", message: "Text must be a non-empty string" });
  } else if (text.length > 5000) {
    errors.push({ field: "text", message: "Text must be less than 5000 characters" });
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

  return {
    valid: errors.length === 0,
    errors,
    data: {
      text: text.trim(),
      level: level?.toUpperCase() || "A1",
    },
  };
};

/**
 * Validate translation request
 */
export const validateTranslation = (body) => {
  const { text, nativeLanguage } = body;
  const errors = [];

  if (!text) {
    errors.push({ field: "text", message: "Text is required" });
  } else if (typeof text !== "string" || text.trim().length < 1) {
    errors.push({ field: "text", message: "Text must be a non-empty string" });
  } else if (text.length > 5000) {
    errors.push({ field: "text", message: "Text must be less than 5000 characters" });
  }

  if (nativeLanguage) {
    const validLanguages = ["fa", "en", "de", "ar", "tr", "ru"];
    if (!validLanguages.includes(nativeLanguage)) {
      errors.push({
        field: "nativeLanguage",
        message: `Native language must be one of: ${validLanguages.join(", ")}`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      text: text.trim(),
      nativeLanguage: nativeLanguage || "fa",
    },
  };
};

/**
 * Validate grammar explanation
 */
export const validateGrammarExplanation = (body) => {
  const { concept, level, nativeLanguage } = body;
  const errors = [];

  if (!concept) {
    errors.push({ field: "concept", message: "Concept is required" });
  } else if (typeof concept !== "string" || concept.trim().length < 1) {
    errors.push({ field: "concept", message: "Concept must be a non-empty string" });
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

  if (nativeLanguage) {
    const validLanguages = ["fa", "en", "de", "ar", "tr", "ru"];
    if (!validLanguages.includes(nativeLanguage)) {
      errors.push({
        field: "nativeLanguage",
        message: `Native language must be one of: ${validLanguages.join(", ")}`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      concept: concept.trim(),
      level: level?.toUpperCase() || "A1",
      nativeLanguage: nativeLanguage || "fa",
    },
  };
};

/**
 * Validate scenario start
 */
export const validateScenarioStart = (body) => {
  const { scenarioType, level } = body;
  const errors = [];

  const validScenarios = ["restaurant", "shopping", "travel", "interview", "doctor"];
  if (!scenarioType) {
    errors.push({ field: "scenarioType", message: "Scenario type is required" });
  } else if (!validScenarios.includes(scenarioType)) {
    errors.push({
      field: "scenarioType",
      message: `Scenario type must be one of: ${validScenarios.join(", ")}`,
    });
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

  return {
    valid: errors.length === 0,
    errors,
    data: {
      scenarioType,
      level: level?.toUpperCase() || "A1",
    },
  };
};

/**
 * Validate scenario continue
 */
export const validateScenarioContinue = (body) => {
  const { sessionId, message } = body;
  const errors = [];

  if (!sessionId) {
    errors.push({ field: "sessionId", message: "Session ID is required" });
  } else if (typeof sessionId !== "string" || sessionId.trim().length < 1) {
    errors.push({ field: "sessionId", message: "Session ID must be a non-empty string" });
  }

  if (!message) {
    errors.push({ field: "message", message: "Message is required" });
  } else if (typeof message !== "string" || message.trim().length < 1) {
    errors.push({ field: "message", message: "Message must be a non-empty string" });
  } else if (message.length > 5000) {
    errors.push({ field: "message", message: "Message must be less than 5000 characters" });
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      sessionId: sessionId.trim(),
      message: message.trim(),
    },
  };
};

export default {
  validateChat,
  validateGrammarCorrection,
  validateTranslation,
  validateGrammarExplanation,
  validateScenarioStart,
  validateScenarioContinue,
};
