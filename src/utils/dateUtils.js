/**
 * دریافت تاریخ امروز به فرمت YYYY-MM-DD
 */
export const getToday = () => {
  const now = new Date();
  return now.toISOString().split("T")[0];
};

/**
 * بررسی اینکه آیا تاریخ امروز است
 */
export const isToday = (dateString) => {
  const today = getToday();
  return dateString === today;
};

/**
 * بررسی اینکه آیا تاریخ دیروز است
 */
export const isYesterday = (dateString) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateString === yesterday.toISOString().split("T")[0];
};

/**
 * دریافت روزهای هفته جاری
 */
export const getCurrentWeekDays = () => {
  const days = [];
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + 1);

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day.toISOString().split("T")[0]);
  }

  return days;
};

/**
 * محاسبه اختلاف روز بین دو تاریخ
 */
export const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
