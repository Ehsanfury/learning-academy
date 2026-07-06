/**
 * helpers.js
 * Path: backend/utils/helpers.js
 * Description: Utility helper functions
 * Changes:
 * - L10: Fixed generateId to use substring instead of deprecated substr
 */

/**
 * ✅ L10: Generate a random ID using substring (not substr)
 * @param {number} length - Length of the ID (default: 9)
 * @returns {string} - Random ID
 */
export const generateId = (length = 9) => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
};

/**
 * Generate a UUID v4
 * @returns {string} - UUID v4
 */
export const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Sleep for a given number of milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after ms
 */
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {boolean} - True if empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

/**
 * Capitalize the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export const capitalize = (str) => {
  if (!str || typeof str !== "string") return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncate a string to a given length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} - Truncated string
 */
export const truncate = (str, length = 100, suffix = "...") => {
  if (!str || typeof str !== "string") return str;
  if (str.length <= length) return str;
  return str.slice(0, length) + suffix;
};

/**
 * Get a random item from an array
 * @param {Array} array - Array to pick from
 * @returns {*} - Random item
 */
export const randomItem = (array) => {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Group an array by a key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} - Grouped object
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

export default {
  generateId,
  generateUUID,
  sleep,
  deepClone,
  isEmpty,
  capitalize,
  truncate,
  randomItem,
  groupBy,
};
