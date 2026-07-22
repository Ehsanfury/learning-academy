/**
 * Sidebar.jsx
 * German Academy
 * نوار کناری داشبورد
 * Changes:
 * - ✅ FIXED: Logout now calls logout from context
 */

import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@context/AuthContext";
import { useLanguageContext } from "@context/LanguageContext";
import { useThemeContext } from "@context/ThemeContext";
import {
  LayoutDashboard,
  BookOpen,
  Dumbbell,
  MessageSquare,
  BookMarked,
  Bot,
  Users,
  Map,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Languages,
  Trophy,
  Flame,
  Info,
  Headphones,
  Shield,
} from "lucide-react";

const menuItems = [
  {
    path: "/dashboard",
    icon: LayoutDashboard,
    label: { fa: "داشبورد", en: "Dashboard" },
  },
  {
    path: "/learn",
    icon: BookOpen,
    label: { fa: "مسیر یادگیری", en: "Learning Path" },
  },
  {
    path: "/practice",
    icon: Dumbbell,
    label: { fa: "تمرین", en: "Practice" },
  },
  {
    path: "/stories",
    icon: BookMarked,
    label: { fa: "داستان‌ها", en: "Stories" },
  },
  {
    path: "/scenarios",
    icon: MessageSquare,
    label: { fa: "سناریوها", en: "Scenarios" },
  },
  {
    path: "/dictionary",
    icon: BookMarked,
    label: { fa: "دیکشنری", en: "Dictionary" },
  },
  {
    path: "/ai-tutor",
    icon: Bot,
    label: { fa: "معلم هوش مصنوعی", en: "AI Tutor" },
    highlight: true,
  },
  {
    path: "/mentors",
    icon: Users,
    label: { fa: "منتورها", en: "Mentors" },
  },
  {
    path: "/journey",
    icon: Map,
    label: { fa: "مسیر سفر", en: "Journey" },
  },
];

const bottomItems = [
  {
    path: "/profile",
    icon: User,
    label: { fa: "پروفایل", en: "Profile" },
  },
  {
    path: "/settings",
    icon: Settings,
    label: { fa: "تنظیمات", en: "Settings" },
  },
  {
    path: "/about",
    icon: Info,
    label: { fa: "درباره ما", en: "About Us" },
  },
  {
    path: "/support",
    icon: Headphones,
    label: { fa: "ارتباط با پشتیبانی", en: "Contact Support" },
  },
];

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguageContext();
  const { isDark, toggleTheme } = useThemeContext();
  const location = useLocation();

  // ✅ FIXED: Logout handler with confirmation
  const handleLogout = async () => {
    if (
      window.confirm(
        language === "fa"
          ? "آیا مطمئن هستید که می‌خواهید خارج شوید؟"
          : "Are you sure you want to logout?",
      )
    ) {
      await logout();
    }
  };

  return (
    <aside
      className={`hidden lg:flex fixed top-0 right-0 bottom-0 z-50 flex-col bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 transition-all duration-300 ${
        isCollapsed ? "w-[72px]" : "w-[280px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200 dark:border-neutral-800">
        {!isCollapsed && (
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {language === "fa" ? "آکادمی آلمانی" : "German Academy"}
            </span>
          </NavLink>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-neutral-500" />
          )}
        </button>
      </div>

      {/* User Profile */}
      <div
        className={`px-4 py-4 border-b border-neutral-200 dark:border-neutral-800 ${isCollapsed ? "text-center" : ""}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-base font-bold text-primary-600 dark:text-primary-400">
              {user?.name?.charAt(0) || "U"}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {user?.name || "کاربر"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-xs text-amber-500">
                  <Flame className="w-3 h-3" />
                  <span>۷</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-primary-500">
                  <Trophy className="w-3 h-3" />
                  <span>۱,۲۵۰ XP</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/dashboard" &&
                location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? "bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                } ${item.highlight && !isActive ? "hover:text-primary-500" : ""}`}
                title={isCollapsed ? item.label[language] : undefined}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${item.highlight && !isActive ? "text-primary-500" : ""}`}
                />

                {!isCollapsed && (
                  <span className="text-sm font-medium">
                    {item.label[language]}
                  </span>
                )}

                {item.highlight && !isActive && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary-500 rounded-full" />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 p-2">
        <div className="space-y-1">
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400"
                    : "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950"
                }`
              }
              title={isCollapsed ? "پنل مدیریت" : undefined}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">
                  {language === "fa" ? "پنل مدیریت" : "Admin Panel"}
                </span>
              )}
            </NavLink>
          )}

          {bottomItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
                title={isCollapsed ? item.label[language] : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">
                    {item.label[language]}
                  </span>
                )}
              </NavLink>
            );
          })}

          <button
            onClick={toggleLanguage}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
            title={
              isCollapsed
                ? language === "fa"
                  ? "English"
                  : "فارسی"
                : undefined
            }
          >
            <Languages className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium">
                {language === "fa" ? "English" : "فارسی"}
              </span>
            )}
          </button>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
            title={
              isCollapsed
                ? isDark
                  ? language === "fa"
                    ? "حالت روشن"
                    : "Light Mode"
                  : language === "fa"
                    ? "حالت تاریک"
                    : "Dark Mode"
                : undefined
            }
          >
            {isDark ? (
              <Sun className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Moon className="w-5 h-5 flex-shrink-0" />
            )}
            {!isCollapsed && (
              <span className="text-sm font-medium">
                {isDark
                  ? language === "fa"
                    ? "حالت روشن"
                    : "Light Mode"
                  : language === "fa"
                    ? "حالت تاریک"
                    : "Dark Mode"}
              </span>
            )}
          </button>

          {/* ✅ Logout Button - FIXED */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950 transition-all duration-200"
            title={
              isCollapsed ? (language === "fa" ? "خروج" : "Logout") : undefined
            }
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium">
                {language === "fa" ? "خروج" : "Logout"}
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
