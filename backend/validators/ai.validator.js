/**
 * ai.validator.js
 * Path: backend/validators/ai.validator.js
 * Description: AI validation schemas
 * Changes:
 * - ✅ FIXED: level.toUpperCase error - handle number/string
 */

import { z } from "zod";

// Chat validation
export const chatSchema = z.object({
  message: z.string().min(1, "Message is required"),
  level: z.union([z.string(), z.number()]).transform((val) => String(val)), // ✅ FIXED: convert to string
  sessionId: z.string().optional().default("default"),
  context: z
    .object({
      role: z.string().optional(),
      topic: z.string().optional(),
      nativeLanguage: z.string().optional(),
      learningGoal: z.string().optional(),
    })
    .optional()
    .default({}),
});

export const validateChat = (data) => {
  try {
    const validated = chatSchema.parse(data);
    return {
      valid: true,
      data: {
        ...validated,
        level: String(validated.level), // ✅ FIXED: ensure string
      },
    };
  } catch (error) {
    return {
      valid: false,
      errors: error.errors?.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })) || [{ message: error.message }],
    };
  }
};

// Grammar correction
export const grammarCorrectionSchema = z.object({
  text: z.string().min(1, "Text is required"),
  level: z.union([z.string(), z.number()]).transform(String).optional(),
});

export const validateGrammarCorrection = (data) => {
  try {
    const validated = grammarCorrectionSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    return {
      valid: false,
      errors: error.errors?.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })) || [{ message: error.message }],
    };
  }
};

// Translation
export const translationSchema = z.object({
  text: z.string().min(1, "Text is required"),
  nativeLanguage: z.string().optional().default("fa"),
});

export const validateTranslation = (data) => {
  try {
    const validated = translationSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    return {
      valid: false,
      errors: error.errors?.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })) || [{ message: error.message }],
    };
  }
};

// Grammar explanation
export const grammarExplanationSchema = z.object({
  concept: z.string().min(1, "Concept is required"),
  level: z.union([z.string(), z.number()]).transform(String).optional(),
  nativeLanguage: z.string().optional().default("fa"),
});

export const validateGrammarExplanation = (data) => {
  try {
    const validated = grammarExplanationSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    return {
      valid: false,
      errors: error.errors?.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })) || [{ message: error.message }],
    };
  }
};

// Scenario
export const scenarioStartSchema = z.object({
  scenarioType: z.string().min(1, "Scenario type is required"),
  level: z.union([z.string(), z.number()]).transform(String).optional(),
});

export const validateScenarioStart = (data) => {
  try {
    const validated = scenarioStartSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    return {
      valid: false,
      errors: error.errors?.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })) || [{ message: error.message }],
    };
  }
};

export const scenarioContinueSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  message: z.string().min(1, "Message is required"),
});

export const validateScenarioContinue = (data) => {
  try {
    const validated = scenarioContinueSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    return {
      valid: false,
      errors: error.errors?.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })) || [{ message: error.message }],
    };
  }
};
