/**
 * helpers.js
 * Path: src/utils/helpers.js
 * Description: Utility helper functions
 * Changes:
 * - ✅ Added formatNumber function
 * - ✅ Added cn function with clsx + tailwind-merge
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================
// 🎨 Class Name Merge
// ============================================

/**
 * Merge class names with Tailwind CSS support
 * Automatically handles conflicting Tailwind classes
 */
export const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};

// ============================================
// 🔢 Number Formatting
// ============================================

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @param {string} locale - Locale (default: 'fa-IR')
 * @returns {string} - Formatted number
 */
export const formatNumber = (num, locale = "fa-IR") => {
  if (num === undefined || num === null || isNaN(num)) {
    return "0";
  }
  return new Intl.NumberFormat(locale).format(num);
};

/**
 * Format number with Persian digits
 * @param {number} num - Number to format
 * @returns {string} - Formatted number with Persian digits
 */
export const toPersianDigits = (num) => {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
};

/**
 * Format number with English digits
 * @param {number} num - Number to format
 * @returns {string} - Formatted number with English digits
 */
export const toEnglishDigits = (num) => {
  const englishDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  return String(num).replace(/[۰-۹]/g, (d) => {
    const index = "۰۱۲۳۴۵۶۷۸۹".indexOf(d);
    return index !== -1 ? englishDigits[index] : d;
  });
};

// ============================================
// 📅 Date Formatting
// ============================================

/**
 * Format date to Persian/English format
 * @param {string|Date} date - Date to format
 * @param {string} locale - 'fa' or 'en'
 * @returns {string} - Formatted date
 */
export const formatDate = (date, locale = "fa") => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString(locale === "fa" ? "fa-IR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format time to Persian/English format
 * @param {string|Date} date - Date to format
 * @param {string} locale - 'fa' or 'en'
 * @returns {string} - Formatted time
 */
export const formatTime = (date, locale = "fa") => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString(locale === "fa" ? "fa-IR" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ============================================
// 📝 String Helpers
// ============================================

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} - Initials (max 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// ============================================
// 🎲 Random Helpers
// ============================================

/**
 * Get random color for avatars
 * @param {string} seed - Seed string for consistent color
 * @returns {string} - Hex color code
 */
export const getAvatarColor = (seed) => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
    "#F8C471",
    "#82E0AA",
    "#F1948A",
    "#85929E",
    "#73C6B6",
  ];

  if (!seed) return colors[0];

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

// ============================================
// 🔍 Validation Helpers
// ============================================

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - Value to check
 * @returns {boolean} - True if empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

/**
 * Safe JSON parse with fallback
 * @param {string} json - JSON string to parse
 * @param {any} fallback - Fallback value on error
 * @returns {any} - Parsed JSON or fallback
 */
export const safeJsonParse = (json, fallback = null) => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

// ============================================
// 🕐 Debounce & Throttle
// ============================================

/**
 * Debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (fn, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle function
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (fn, limit = 300) => {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ============================================
// 📦 Default Export
// ============================================

export default {
  cn,
  formatNumber,
  toPersianDigits,
  toEnglishDigits,
  formatDate,
  formatTime,
  getInitials,
  truncateText,
  capitalize,
  getAvatarColor,
  isEmpty,
  safeJsonParse,
  debounce,
  throttle,
};
