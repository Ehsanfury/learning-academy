/**
 * فرمت تاریخ شمسی
 */
export const formatPersianDate = (date) => {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

/**
 * فرمت تاریخ میلادی
 */
export const formatEnglishDate = (date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

/**
 * فرمت تاریخ نسبی (مثلاً "۳ روز پیش")
 */
export const formatRelativeTime = (date, locale = "fa") => {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now - target) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  const labels = {
    fa: {
      year: "سال",
      month: "ماه",
      week: "هفته",
      day: "روز",
      hour: "ساعت",
      minute: "دقیقه",
      now: "همین الان",
      ago: "پیش",
    },
    en: {
      year: "year",
      month: "month",
      week: "week",
      day: "day",
      hour: "hour",
      minute: "minute",
      now: "just now",
      ago: "ago",
    },
  };

  const l = labels[locale];

  for (const [unit, seconds] of Object.entries(intervals)) {
    const count = Math.floor(diffInSeconds / seconds);
    if (count >= 1) {
      return locale === "fa"
        ? `${count} ${l[unit]} ${l.ago}`
        : `${count} ${l[unit]}${count > 1 ? "s" : ""} ${l.ago}`;
    }
  }

  return l.now;
};

/**
 * فرمت مدت زمان (دقیقه)
 */
export const formatDuration = (minutes, locale = "fa") => {
  if (minutes < 60) {
    return locale === "fa" ? `${minutes} دقیقه` : `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return locale === "fa" ? `${hours} ساعت` : `${hours}h`;
  }
  return locale === "fa"
    ? `${hours} ساعت و ${mins} دقیقه`
    : `${hours}h ${mins}m`;
};

/**
 * فرمت XP
 */
export const formatXP = (xp, locale = "fa") => {
  if (xp >= 1000) {
    return locale === "fa"
      ? `${(xp / 1000).toFixed(1)}k XP`
      : `${(xp / 1000).toFixed(1)}k XP`;
  }
  return `${xp} XP`;
};
