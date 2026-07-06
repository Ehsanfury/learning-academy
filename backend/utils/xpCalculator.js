/**
 * xpCalculator.js
 * German Academy
 XP and Level calculations
 * Changes:
 * - M23: Consolidated XP/Level calculations (single source of truth)
 * - All level calculations now use this file
 */

/**
// TODO: Translate - TODO: Translate - * سطوح و XP مورد نیاز برای هر سطح
 */
export const LEVELS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 500 },
  { level: 3, xp: 1200 },
  { level: 4, xp: 2500 },
  { level: 5, xp: 5000 },
  { level: 6, xp: 8000 },
  { level: 7, xp: 12000 },
  { level: 8, xp: 16000 },
  { level: 9, xp: 22000 },
  { level: 10, xp: 30000 },
  { level: 11, xp: 40000 },
  { level: 12, xp: 52000 },
  { level: 13, xp: 66000 },
  { level: 14, xp: 82000 },
  { level: 15, xp: 100000 },
];

/**
// TODO: Translate - TODO: Translate - * ✅ M23: محاسبه سطح کاربر بر اساس XP (single source of truth)
// TODO: Translate - TODO: Translate - * @param {number} xp - امتیاز کاربر
// TODO: Translate - TODO: Translate - * @returns {number} - سطح کاربر
 */
export const calculateLevel = (xp) => {
  let currentLevel = 1;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      currentLevel = LEVELS[i].level;
      break;
    }
  }
  return currentLevel;
};

/**
// TODO: Translate - TODO: Translate - * ✅ M23: محاسبه سطح با فرمول ساده (برای مواردی که نیاز به محاسبه سریع دارند)
// TODO: Translate - TODO: Translate - * @param {number} xp - امتیاز کاربر
// TODO: Translate - TODO: Translate - * @param {number} xpPerLevel - XP مورد نیاز برای هر سطح (پیش‌فرض: 100)
// TODO: Translate - TODO: Translate - * @returns {number} - سطح کاربر
 */
export const calculateLevelSimple = (xp, xpPerLevel = 100) => {
  return Math.floor(xp / xpPerLevel) + 1;
};

/**
// TODO: Translate - TODO: Translate - * محاسبه XP پتانسیل بر اساس امتیاز درس
 */
export const calculatePotentialXP = (baseXP, score, isPerfect = false, bonusXP = 0) => {
  let xp = Math.round(baseXP * (score / 100));
  if (isPerfect && score === 100) {
    xp += bonusXP;
  }
  return xp;
};

/**
// TODO: Translate - TODO: Translate - * محاسبه XP قابل کسب (با در نظر گرفتن تلاش‌های قبلی)
 */
export const calculateEarnedXP = (newPotentialXP, previousPotentialXP = 0) => {
  return Math.max(0, newPotentialXP - previousPotentialXP);
};

/**
// TODO: Translate - TODO: Translate - * محاسبه XP مورد نیاز برای سطح بعدی
 */
export const getXPToNextLevel = (currentLevel, currentXP) => {
  const currentLevelData = LEVELS.find((l) => l.level === currentLevel);
  const nextLevelData = LEVELS.find((l) => l.level === currentLevel + 1);

  if (!nextLevelData) return 0;
  return nextLevelData.xp - currentXP;
};

/**
// TODO: Translate - TODO: Translate - * دریافت اطلاعات سطح
 */
export const getLevelInfo = (level) => {
  return LEVELS.find((l) => l.level === level) || null;
};

/**
// TODO: Translate - TODO: Translate - * دریافت پیشرفت به سطح بعدی (درصد)
 */
export const getLevelProgress = (xp) => {
  const currentLevel = calculateLevel(xp);
  const currentLevelData = LEVELS.find((l) => l.level === currentLevel);
  const nextLevelData = LEVELS.find((l) => l.level === currentLevel + 1);

  if (!nextLevelData) return 100;

  const xpInLevel = xp - (currentLevelData?.xp || 0);
  const xpNeeded = nextLevelData.xp - (currentLevelData?.xp || 0);

  return Math.round((xpInLevel / xpNeeded) * 100);
};

export default {
  LEVELS,
  calculateLevel,
  calculateLevelSimple,
  calculatePotentialXP,
  calculateEarnedXP,
  getXPToNextLevel,
  getLevelInfo,
  getLevelProgress,
};
