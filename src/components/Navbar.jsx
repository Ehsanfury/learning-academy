/**
 * Navbar.jsx
 * German Academy
 * نوار بالایی
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@context/AuthContext"; // ✅ اصلاح شده
import { useLanguageContext } from "@context/LanguageContext";
import { useThemeContext } from "@context/ThemeContext";
import {
  Bell,
  Search,
  Sun,
  Moon,
  Languages,
  LogOut,
  User,
  Settings,
  Menu,
  X,
} from "lucide-react";
import Modal from "@components/Modal";

function Navbar() {
  const { user, logout } = useAuth(); // ✅ اصلاح شده
  const { language, toggleLanguage } = useLanguageContext();
  const { isDark, toggleTheme } = useThemeContext();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4">
        {/* Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          {showMobileMenu ? (
            <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          ) : (
            <Menu className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          )}
        </button>

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">G</span>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNotifications(true)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 relative"
          >
            <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
          </button>

          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                {user?.name?.charAt(0) || "U"}
              </span>
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
            />
            <motion.div
              className="lg:hidden fixed top-0 right-0 bottom-0 z-40 w-72 bg-white dark:bg-neutral-950 shadow-xl p-6 pt-20 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex items-center gap-3 mb-6 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {user?.name || "کاربر"}
                  </p>
                  <p className="text-sm text-neutral-500">سطح ۱</p>
                </div>
              </div>

              <nav className="space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <User className="w-5 h-5 text-neutral-500" />
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {language === "fa" ? "پروفایل" : "Profile"}
                  </span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Settings className="w-5 h-5 text-neutral-500" />
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {language === "fa" ? "تنظیمات" : "Settings"}
                  </span>
                </Link>

                <hr className="my-2 border-neutral-200 dark:border-neutral-800" />

                <button
                  onClick={toggleLanguage}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Languages className="w-5 h-5 text-neutral-500" />
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {language === "fa" ? "English" : "فارسی"}
                  </span>
                </button>

                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-neutral-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-neutral-500" />
                  )}
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {isDark
                      ? language === "fa"
                        ? "حالت روشن"
                        : "Light Mode"
                      : language === "fa"
                        ? "حالت تاریک"
                        : "Dark Mode"}
                  </span>
                </button>

                <hr className="my-2 border-neutral-200 dark:border-neutral-800" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-danger-50 dark:hover:bg-danger-950 transition-colors text-danger-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{language === "fa" ? "خروج" : "Logout"}</span>
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* User Menu Popover */}
      <AnimatePresence>
        {showUserMenu && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUserMenu(false)}
            />
            <motion.div
              className="lg:hidden fixed top-16 left-4 z-50 w-64 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 mb-2">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {user?.name || "کاربر"}
                </p>
                <p className="text-sm text-neutral-500">{user?.email}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <User className="w-4 h-4" />
                {language === "fa" ? "پروفایل" : "Profile"}
              </Link>
              <Link
                to="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Settings className="w-4 h-4" />
                {language === "fa" ? "تنظیمات" : "Settings"}
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-950 text-danger-600 mt-2"
              >
                <LogOut className="w-4 h-4" />
                {language === "fa" ? "خروج" : "Logout"}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notifications Modal */}
      <Modal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        title={language === "fa" ? "اعلان‌ها" : "Notifications"}
      >
        <div className="text-center py-8 text-neutral-500">
          <Bell className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
          <p>
            {language === "fa" ? "هنوز اعلانی ندارید" : "No notifications yet"}
          </p>
        </div>
      </Modal>
    </>
  );
}

export default Navbar;
