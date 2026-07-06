/**
 * تاخیر برای شبیه‌سازی عملیات async
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * فرمت کردن عدد با جداکننده هزارگان
 */
export const formatNumber = (num, locale = "fa") => {
  return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US").format(num);
};

/**
 * کوتاه کردن متن با تعداد کاراکتر مشخص
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

/**
 * ساخت یک ID یکتا
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * کلاس‌های شرطی با clsx
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

/**
 * محاسبه درصد پیشرفت
 */
export const calculateProgress = (current, total) => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

/**
 * تشخیص دستگاه موبایل
 */
export const isMobile = () => {
  return window.innerWidth < 768;
};

/**
 * تشخیص مرورگر از نوع WebKit
 */
export const isWebKit = () => {
  return /AppleWebKit/.test(navigator.userAgent);
};
