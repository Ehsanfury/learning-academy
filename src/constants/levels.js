const LEVELS = {
  A1: {
    id: "A1",
    name: { fa: "مقدماتی A1", en: "Beginner A1" },
    description: {
      fa: "یادگیری عبارات پایه و روزمره برای نیازهای ابتدایی",
      en: "Learn basic everyday phrases for simple needs",
    },
    totalLessons: 60,
    requiredXP: 0,
    color: "#22c55e",
    gradient: "from-green-400 to-green-600",
  },
  A2: {
    id: "A2",
    name: { fa: "مقدماتی A2", en: "Elementary A2" },
    description: {
      fa: "ارتباط در موقعیت‌های روزمره و بیان نیازهای ساده",
      en: "Communicate in routine situations and express simple needs",
    },
    totalLessons: 80,
    requiredXP: 1000,
    color: "#3b82f6",
    gradient: "from-blue-400 to-blue-600",
  },
  B1: {
    id: "B1",
    name: { fa: "متوسط B1", en: "Intermediate B1" },
    description: {
      fa: "مدیریت اکثر موقعیت‌ها در سفر و بحث درباره موضوعات آشنا",
      en: "Handle most travel situations and discuss familiar topics",
    },
    totalLessons: 100,
    requiredXP: 2500,
    color: "#f59e0b",
    gradient: "from-amber-400 to-amber-600",
  },
  B2: {
    id: "B2",
    name: { fa: "متوسط B2", en: "Upper Intermediate B2" },
    description: {
      fa: "ارتباط روان با افراد بومی و بحث درباره موضوعات پیچیده",
      en: "Fluent communication with native speakers on complex topics",
    },
    totalLessons: 120,
    requiredXP: 5000,
    color: "#f97316",
    gradient: "from-orange-400 to-orange-600",
  },
  C1: {
    id: "C1",
    name: { fa: "پیشرفته C1", en: "Advanced C1" },
    description: {
      fa: "استفاده منعطف و مؤثر از زبان برای اهداف اجتماعی و حرفه‌ای",
      en: "Flexible and effective use of language for social and professional purposes",
    },
    totalLessons: 100,
    requiredXP: 10000,
    color: "#ef4444",
    gradient: "from-red-400 to-red-600",
  },
  C2: {
    id: "C2",
    name: { fa: "تسلط C2", en: "Mastery C2" },
    description: {
      fa: "تسلط کامل بر زبان در تمام موقعیت‌ها",
      en: "Complete mastery of the language in all situations",
    },
    totalLessons: 80,
    requiredXP: 20000,
    color: "#a855f7",
    gradient: "from-purple-400 to-purple-600",
  },
};

export default LEVELS;
