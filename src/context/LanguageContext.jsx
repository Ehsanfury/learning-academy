/**
 * LanguageContext.jsx
 * Path: src/context/LanguageContext.jsx
 * Description: Language context with multi-language support
 * Changes:
 * - ✅ Added useLanguageContext as alias for useLanguage
 * - ✅ Fixed exports for backward compatibility
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

// ============================================
// 📚 Translations
// ============================================

const translations = {
  fa: {
    common: {
      welcome: "خوش آمدید",
      login: "ورود",
      register: "ثبت‌نام",
      logout: "خروج",
      dashboard: "داشبورد",
      profile: "پروفایل",
      settings: "تنظیمات",
      learn: "یادگیری",
      practice: "تمرین",
      continue: "ادامه",
      back: "بازگشت",
      save: "ذخیره",
      cancel: "انصراف",
      delete: "حذف",
      edit: "ویرایش",
      retry: "تلاش مجدد",
      search: "جستجو",
      loading: "در حال بارگذاری...",
    },
    nav: {
      dashboard: "داشبورد",
      learn: "یادگیری",
      practice: "تمرین",
      ai_tutor: "معلم هوش مصنوعی",
      dictionary: "دیکشنری",
      stories: "داستان‌ها",
      scenarios: "سناریوها",
      mentors: "منتورها",
      achievements: "دستاوردها",
      leaderboard: "جدول رهبران",
      profile: "پروفایل",
      settings: "تنظیمات",
    },
    dashboard: {
      greeting: "صبح بخیر",
      greeting_afternoon: "ظهر بخیر",
      greeting_evening: "عصر بخیر",
      greeting_night: "شب بخیر",
      today_goal: "هدف روزانه",
      weekly_activity: "فعالیت هفتگی",
      continue_learning: "ادامه یادگیری",
      view_all: "مشاهده همه",
      no_lessons: "هنوز درسی شروع نکردی!",
      start_learning: "شروع یادگیری",
      continue_last: "ادامه آخرین درس",
      next_lesson: "درس بعدی",
      achievements: "دستاوردها",
      quick_stats: "آمار سریع",
      lessons_done: "درس تکمیل شده",
      total_lessons: "کل درس‌ها",
      level: "سطح",
      streak: "گل‌زنی",
      quick_actions: "دسترسی سریع",
      quick_practice: "تمرین سریع",
      chat_ai: "چت با هوش مصنوعی",
      daily_story: "داستان روز",
      dictionary: "دیکشنری",
    },
  },
  en: {
    common: {
      welcome: "Welcome",
      login: "Login",
      register: "Register",
      logout: "Logout",
      dashboard: "Dashboard",
      profile: "Profile",
      settings: "Settings",
      learn: "Learn",
      practice: "Practice",
      continue: "Continue",
      back: "Back",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      retry: "Retry",
      search: "Search",
      loading: "Loading...",
    },
    nav: {
      dashboard: "Dashboard",
      learn: "Learn",
      practice: "Practice",
      ai_tutor: "AI Tutor",
      dictionary: "Dictionary",
      stories: "Stories",
      scenarios: "Scenarios",
      mentors: "Mentors",
      achievements: "Achievements",
      leaderboard: "Leaderboard",
      profile: "Profile",
      settings: "Settings",
    },
    dashboard: {
      greeting: "Good Morning",
      greeting_afternoon: "Good Afternoon",
      greeting_evening: "Good Evening",
      greeting_night: "Good Night",
      today_goal: "Daily Goal",
      weekly_activity: "Weekly Activity",
      continue_learning: "Continue Learning",
      view_all: "View All",
      no_lessons: "No lessons started yet!",
      start_learning: "Start Learning",
      continue_last: "Continue Last Lesson",
      next_lesson: "Next Lesson",
      achievements: "Achievements",
      quick_stats: "Quick Stats",
      lessons_done: "Lessons Done",
      total_lessons: "Total Lessons",
      level: "Level",
      streak: "Streak",
      quick_actions: "Quick Actions",
      quick_practice: "Quick Practice",
      chat_ai: "Chat with AI",
      daily_story: "Daily Story",
      dictionary: "Dictionary",
    },
  },
};

// ============================================
// 🔧 Helper
// ============================================

const getNestedValue = (obj, path) => {
  if (!obj || !path) return path;
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return path;
    }
  }
  return current;
};

// ============================================
// 📦 Context
// ============================================

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("german_academy_language");
    if (saved && (saved === "fa" || saved === "en")) {
      return saved;
    }
    const browserLang = navigator.language?.split("-")[0];
    return browserLang === "en" ? "en" : "fa";
  });

  const supportedLanguages = useMemo(
    () => [
      { code: "fa", name: "فارسی", dir: "rtl" },
      { code: "en", name: "English", dir: "ltr" },
    ],
    [],
  );

  useEffect(() => {
    const lang = supportedLanguages.find((l) => l.code === language);
    document.documentElement.lang = language;
    document.documentElement.dir = lang?.dir || "ltr";
    localStorage.setItem("german_academy_language", language);
  }, [language, supportedLanguages]);

  const t = useCallback(
    (key, fallback = "") => {
      const translation = translations[language];
      if (!translation) return fallback || key;
      const value = getNestedValue(translation, key);
      return value || fallback || key;
    },
    [language],
  );

  const changeLanguage = useCallback(
    (lang) => {
      if (supportedLanguages.some((l) => l.code === lang)) {
        setLanguage(lang);
      }
    },
    [supportedLanguages],
  );

  const toggleLanguage = useCallback(() => {
    const newLang = language === "fa" ? "en" : "fa";
    setLanguage(newLang);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      changeLanguage,
      toggleLanguage,
      t,
      dir: language === "fa" ? "rtl" : "ltr",
      isRTL: language === "fa",
      supportedLanguages,
    }),
    [language, t, changeLanguage, toggleLanguage, supportedLanguages],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// ✅ Main hook for using language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// ✅ ALIAS for backward compatibility (used in MainLayout.jsx and AuthLayout.jsx)
export const useLanguageContext = useLanguage;

export default LanguageContext;
