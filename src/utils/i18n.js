/**
 * i18n.js
 * Path: src/utils/i18n.js
 * Description: Internationalization utilities for multi-language support
 * Changes:
 * - ✅ New file created
 * - ✅ getLocalizedText function for handling {fa, en, de} objects
 * - ✅ Safe fallback for missing translations
 */

/**
 * Get localized text from a multi-language object
 * @param {string|object} value - The value to localize (string or {fa, en, de})
 * @param {string} lang - Current language (fa, en, de)
 * @param {string} fallback - Fallback value if translation not found
 * @returns {string} Localized text
 */
export const getLocalizedText = (value, lang = "fa", fallback = "") => {
  // If value is null or undefined
  if (!value) return fallback;

  // If value is already a string, return it
  if (typeof value === "string") return value;

  // If value is an object with language keys
  if (typeof value === "object") {
    // Try current language first
    if (value[lang]) return value[lang];

    // Try fallback languages
    if (value.fa) return value.fa;
    if (value.en) return value.en;
    if (value.de) return value.de;

    // Try first available value
    const firstValue = Object.values(value)[0];
    if (firstValue && typeof firstValue === "string") return firstValue;

    // Return fallback
    return fallback;
  }

  // If value is anything else, convert to string
  return String(value) || fallback;
};

/**
 * Get localized text with current language from context
 * @param {string|object} value - The value to localize
 * @param {string} language - Current language from context
 * @param {string} fallback - Fallback value
 * @returns {string} Localized text
 */
export const t = (value, language, fallback = "") => {
  return getLocalizedText(value, language, fallback);
};

/**
 * Check if a value is a multi-language object
 * @param {any} value - The value to check
 * @returns {boolean} True if value is a multi-language object
 */
export const isMultiLanguageObject = (value) => {
  if (!value || typeof value !== "object") return false;
  return !!(value.fa || value.en || value.de);
};

/**
 * Get all available languages from an object
 * @param {object} value - The multi-language object
 * @returns {string[]} Array of available language codes
 */
export const getAvailableLanguages = (value) => {
  if (!value || typeof value !== "object") return [];
  return Object.keys(value).filter(
    (key) => typeof value[key] === "string" && value[key].trim(),
  );
};

export default {
  getLocalizedText,
  t,
  isMultiLanguageObject,
  getAvailableLanguages,
};
