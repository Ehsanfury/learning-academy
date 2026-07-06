/**
 * questionTypes.js
 * Path: src/features/lesson-engine/constants/questionTypes.js
 * Description: Centralized question type constants
 * Changes:
 * - NEW: Single source of truth for question types
 * - FIXED C8: Unified naming convention
 */

/**
 * Standard question types (single source of truth)
 * Use these constants everywhere in the codebase
 */
export const QUESTION_TYPES = {
  // Core types (standard naming with hyphen)
  MULTIPLE_CHOICE: "multiple-choice",
  FILL_IN_BLANK: "fill-in-blank",
  MATCHING: "matching",
  ORDERING: "ordering",
  TRANSLATION: "translation",
  LISTENING: "listening",
  SPEAKING: "speaking",
  WRITING: "writing",
  TRUE_FALSE: "true-false",
  DRAG_DROP: "drag-drop",
  DICTATION: "dictation",
  ERROR_DETECTION: "error-detection",
  WORD_BUILDING: "word-building",
  MINI_DIALOGUE: "mini-dialogue",
  PICTURE_EXERCISE: "picture-exercise",
  SCENARIO: "scenario",
};

/**
 * Legacy type mappings (for backward compatibility)
 * Maps old/legacy names to standard names
 */
export const LEGACY_TYPE_MAP = {
  // Legacy names (underscore style)
  multiple_choice: QUESTION_TYPES.MULTIPLE_CHOICE,
  fill_in: QUESTION_TYPES.FILL_IN_BLANK,
  fill_blank: QUESTION_TYPES.FILL_IN_BLANK,
  true_false: QUESTION_TYPES.TRUE_FALSE,
  drag_drop: QUESTION_TYPES.DRAG_DROP,

  // Alternative names
  "fill-blank": QUESTION_TYPES.FILL_IN_BLANK,
  "multiple-choice": QUESTION_TYPES.MULTIPLE_CHOICE,
  "true-false": QUESTION_TYPES.TRUE_FALSE,
  "drag-drop": QUESTION_TYPES.DRAG_DROP,
};

/**
 * Normalize a question type to standard name
 * @param {string} type - Raw question type
 * @returns {string} - Normalized question type
 */
export const normalizeQuestionType = (type) => {
  if (!type) return QUESTION_TYPES.MULTIPLE_CHOICE;

  // Check if it's already a standard type
  const standardTypes = Object.values(QUESTION_TYPES);
  if (standardTypes.includes(type)) {
    return type;
  }

  // Check legacy mapping
  return LEGACY_TYPE_MAP[type] || type;
};

/**
 * Check if a type is valid
 * @param {string} type - Question type to validate
 * @returns {boolean} - True if valid
 */
export const isValidQuestionType = (type) => {
  return Object.values(QUESTION_TYPES).includes(normalizeQuestionType(type));
};

/**
 * Get all valid question types as an array
 * @returns {Array<string>} - List of all question types
 */
export const getAllQuestionTypes = () => {
  return Object.values(QUESTION_TYPES);
};

/**
 * Get display name for a question type
 * @param {string} type - Question type
 * @param {string} language - Language code (fa, en, de)
 * @returns {string} - Display name
 */
export const getQuestionTypeDisplayName = (type, language = "fa") => {
  const normalized = normalizeQuestionType(type);

  const displayNames = {
    [QUESTION_TYPES.MULTIPLE_CHOICE]: {
      fa: "چند گزینه‌ای",
      en: "Multiple Choice",
      de: "Multiple Choice",
    },
    [QUESTION_TYPES.FILL_IN_BLANK]: {
      fa: "پر کردن جای خالی",
      en: "Fill in the Blank",
      de: "Lückentext",
    },
    [QUESTION_TYPES.MATCHING]: {
      fa: "تطابق",
      en: "Matching",
      de: "Zuordnung",
    },
    [QUESTION_TYPES.ORDERING]: {
      fa: "مرتب‌سازی",
      en: "Ordering",
      de: "Reihenfolge",
    },
    [QUESTION_TYPES.TRANSLATION]: {
      fa: "ترجمه",
      en: "Translation",
      de: "Übersetzung",
    },
    [QUESTION_TYPES.LISTENING]: {
      fa: "شنیداری",
      en: "Listening",
      de: "Hörverständnis",
    },
    [QUESTION_TYPES.SPEAKING]: {
      fa: "گفتاری",
      en: "Speaking",
      de: "Sprechen",
    },
    [QUESTION_TYPES.WRITING]: {
      fa: "نوشتاری",
      en: "Writing",
      de: "Schreiben",
    },
    [QUESTION_TYPES.TRUE_FALSE]: {
      fa: "صحیح/غلط",
      en: "True/False",
      de: "Richtig/Falsch",
    },
    [QUESTION_TYPES.DRAG_DROP]: {
      fa: "کشیدن و رها کردن",
      en: "Drag & Drop",
      de: "Drag & Drop",
    },
    [QUESTION_TYPES.DICTATION]: {
      fa: "دیکته",
      en: "Dictation",
      de: "Diktat",
    },
    [QUESTION_TYPES.ERROR_DETECTION]: {
      fa: "تشخیص خطا",
      en: "Error Detection",
      de: "Fehlererkennung",
    },
    [QUESTION_TYPES.WORD_BUILDING]: {
      fa: "ساخت کلمه",
      en: "Word Building",
      de: "Wortbildung",
    },
    [QUESTION_TYPES.MINI_DIALOGUE]: {
      fa: "گفتگوی کوتاه",
      en: "Mini Dialogue",
      de: "Minidialog",
    },
    [QUESTION_TYPES.PICTURE_EXERCISE]: {
      fa: "تمرین تصویری",
      en: "Picture Exercise",
      de: "Bildübung",
    },
    [QUESTION_TYPES.SCENARIO]: {
      fa: "سناریو",
      en: "Scenario",
      de: "Szenario",
    },
  };

  return displayNames[normalized]?.[language] || normalized;
};

export default {
  QUESTION_TYPES,
  LEGACY_TYPE_MAP,
  normalizeQuestionType,
  isValidQuestionType,
  getAllQuestionTypes,
  getQuestionTypeDisplayName,
};
