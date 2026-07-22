/**
 * MainLayout.jsx
 * Path: src/layouts/MainLayout.jsx
 * Description: Main layout with responsive navbar and mobile support
 * Changes:
 * - ✅ FIXED: Logout function properly calls auth.logout
 * - ✅ FIXED: Admin Panel only shows for admin users
 * - ✅ FIXED: Added About & Support to user dropdown menu
 */

import React, { useState, useEffect, useCallback } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguageContext } from "../context/LanguageContext";
import { useThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useIsMobile } from "../hooks/MobileDetect";
import {
  Sun,
  Moon,
  Languages,
  LogIn,
  User,
  BookOpen,
  Users,
  Bot,
  ArrowUp,
  Menu,
  X,
  Home,
  LayoutDashboard,
  Dumbbell,
  BookMarked,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  Info,
  Headphones,
} from "lucide-react";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

// ============================================
// 📊 Navigation Items
// ============================================

const NAV_ITEMS = [
  {
    path: "/learn",
    label: { fa: "مسیر یادگیری", en: "Learning Path" },
    icon: BookOpen,
  },
  { path: "/practice", label: { fa: "تمرین", en: "Practice" }, icon: Dumbbell },
  { path: "/ai-tutor", label: { fa: "هوش مصنوعی", en: "AI Tutor" }, icon: Bot },
  {
    path: "/dictionary",
    label: { fa: "دیکشنری", en: "Dictionary" },
    icon: BookMarked,
  },
];

const MOBILE_NAV_ITEMS = [
  {
    path: "/dashboard",
    label: { fa: "داشبورد", en: "Dashboard" },
    icon: LayoutDashboard,
  },
  { path: "/learn", label: { fa: "یادگیری", en: "Learn" }, icon: BookOpen },
  { path: "/practice", label: { fa: "تمرین", en: "Practice" }, icon: Dumbbell },
  { path: "/ai-tutor", label: { fa: "هوش مصنوعی", en: "AI Tutor" }, icon: Bot },
  { path: "/profile", label: { fa: "پروفایل", en: "Profile" }, icon: User },
];

// ============================================
// 📊 MainLayout Component
// ============================================

const MainLayout = () => {
  const { language, toggleLanguage } = useLanguageContext();
  const { isDark, toggleTheme } = useThemeContext();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ FIXED: Proper logout handler with navigation
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      setMobileMenuOpen(false);
      toast.success(
        language === "fa" ? "با موفقیت خارج شدید" : "Logged out successfully",
      );
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(language === "fa" ? "خطا در خروج" : "Logout error");
    }
  }, [logout, navigate, language]);

  // ============================================
  // 📊 User Dropdown Menu Items
  // ============================================

  const userMenuItems = [
    { path: "/profile", label: { fa: "پروفایل", en: "Profile" }, icon: User },
    {
      path: "/settings",
      label: { fa: "تنظیمات", en: "Settings" },
      icon: Settings,
    },
    // ✅ Admin Panel - فقط برای ادمین‌ها
    ...(user?.role === "admin"
      ? [
          {
            path: "/admin",
            label: { fa: "پنل مدیریت", en: "Admin Panel" },
            icon: Shield,
          },
        ]
      : []),
    { type: "divider" },
    { path: "/about", label: { fa: "درباره ما", en: "About Us" }, icon: Info },
    {
      path: "/contact",
      label: { fa: "تماس با ما", en: "Contact Us" },
      icon: Headphones,
    },
    { type: "divider" },
    {
      path: "/logout",
      label: { fa: "خروج", en: "Logout" },
      icon: LogOut,
      isLogout: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100 hidden sm:block">
              {language === "fa" ? "آکادمی یادگیری" : "Learning Academy"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? "text-primary-500 bg-primary-50 dark:bg-primary-950"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-primary-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  {item.label[language]}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Languages className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              <span className="text-xs ml-1">
                {language === "fa" ? "EN" : "FA"}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-blue-500" />
              )}
            </button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hidden sm:block">
                  <Button variant="primary" size="sm" icon={LayoutDashboard}>
                    {language === "fa" ? "داشبورد" : "Dashboard"}
                  </Button>
                </Link>

                {/* User Dropdown Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${userMenuOpen ? "rotate-90" : ""}`}
                    />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden z-50"
                      >
                        <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                            {user?.name || "User"}
                          </p>
                          <p className="text-xs text-neutral-500 truncate">
                            {user?.email || ""}
                          </p>
                        </div>

                        <div className="p-1">
                          {userMenuItems.map((item, index) => {
                            if (item.type === "divider") {
                              return (
                                <hr
                                  key={index}
                                  className="my-1 border-neutral-200 dark:border-neutral-700"
                                />
                              );
                            }

                            const Icon = item.icon;

                            if (item.isLogout) {
                              return (
                                <button
                                  key={index}
                                  onClick={handleLogout}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                                >
                                  <Icon className="w-4 h-4" />
                                  {item.label[language]}
                                </button>
                              );
                            }

                            return (
                              <Link
                                key={index}
                                to={item.path}
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                              >
                                <Icon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                                {item.label[language]}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" icon={LogIn}>
                    <span className="hidden sm:inline">
                      {language === "fa" ? "ورود" : "Login"}
                    </span>
                  </Button>
                </Link>
                <Link to="/register" className="hidden sm:block">
                  <Button variant="primary" size="sm">
                    {language === "fa" ? "شروع یادگیری" : "Start Learning"}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-neutral-600" />
              ) : (
                <Menu className="w-6 h-6 text-neutral-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ========== MOBILE MENU ========== */}
      <AnimatePresence>
        {mobileMenuOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed top-0 right-0 bottom-0 z-40 w-72 max-w-[80vw] bg-white dark:bg-neutral-950 shadow-2xl p-6 pt-20 overflow-y-auto"
            >
              {user && (
                <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xl font-bold text-primary-600 dark:text-primary-400">
                      {user.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {user.name}
                      </p>
                      <p className="text-xs text-neutral-500">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <nav className="space-y-1">
                {MOBILE_NAV_ITEMS.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                        isActive
                          ? "bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400"
                          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label[language]}</span>
                      {isActive && <ChevronRight className="w-4 h-4 mr-auto" />}
                    </Link>
                  );
                })}

                <hr className="my-2 border-neutral-200 dark:border-neutral-800" />

                {user?.role === "admin" && (
                  <>
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 transition"
                    >
                      <Shield className="w-5 h-5" />
                      <span>
                        {language === "fa" ? "پنل مدیریت" : "Admin Panel"}
                      </span>
                    </Link>
                    <hr className="my-2 border-neutral-200 dark:border-neutral-800" />
                  </>
                )}

                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 hover:bg-neutral-100 transition"
                >
                  <Info className="w-5 h-5" />
                  <span>{language === "fa" ? "درباره ما" : "About Us"}</span>
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 hover:bg-neutral-100 transition"
                >
                  <Headphones className="w-5 h-5" />
                  <span>{language === "fa" ? "تماس با ما" : "Contact Us"}</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 hover:bg-neutral-100 transition"
                >
                  <Settings className="w-5 h-5" />
                  <span>{language === "fa" ? "تنظیمات" : "Settings"}</span>
                </Link>

                <hr className="my-2 border-neutral-200 dark:border-neutral-800" />

                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{language === "fa" ? "خروج" : "Logout"}</span>
                  </button>
                )}

                {!isAuthenticated && (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-primary-600 hover:bg-primary-50 transition"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>{language === "fa" ? "ورود" : "Login"}</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition"
                    >
                      <User className="w-5 h-5" />
                      <span>{language === "fa" ? "ثبت‌نام" : "Register"}</span>
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========== MAIN CONTENT ========== */}
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="container-app py-4 sm:py-6 md:py-8"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 transition-colors flex items-center justify-center"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer language={language} />
    </div>
  );
};

// ============================================
// 📋 Footer Component
// ============================================

const Footer = ({ language }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {language === "fa" ? "آکادمی یادگیری" : "Learning Academy"}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              {language === "fa"
                ? "یادگیری هوشمند آلمانی"
                : "Smart German Learning"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Quick Links
            </h4>
            <ul className="mt-2 space-y-2">
              <li>
                <Link
                  to="/learn"
                  className="text-sm text-neutral-500 hover:text-primary-500"
                >
                  Learning Path
                </Link>
              </li>
              <li>
                <Link
                  to="/practice"
                  className="text-sm text-neutral-500 hover:text-primary-500"
                >
                  Practice
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Resources
            </h4>
            <ul className="mt-2 space-y-2">
              <li>
                <Link
                  to="/stories"
                  className="text-sm text-neutral-500 hover:text-primary-500"
                >
                  Stories
                </Link>
              </li>
              <li>
                <Link
                  to="/mentors"
                  className="text-sm text-neutral-500 hover:text-primary-500"
                >
                  Mentors
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              About
            </h4>
            <ul className="mt-2 space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-neutral-500 hover:text-primary-500"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-neutral-500 hover:text-primary-500"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-center text-xs text-neutral-400">
          <p>© {currentYear} Learning Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default MainLayout;
