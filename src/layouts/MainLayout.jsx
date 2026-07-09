/**
 * MainLayout.jsx
 * Path: src/layouts/MainLayout.jsx
 * Description: Main layout with responsive navbar and mobile support
 * Project: Learning Academy
 * Version: 3.2 - PUBLIC LAYOUT - NO REDIRECT TO LOGIN
 * Changes:
 * - ✅ FIXED: This layout is PUBLIC - does NOT redirect to login
 * - ✅ FIXED: Added About & Support to user dropdown menu
 * - ✅ FIXED: 5-column footer with proper sizing
 * - ✅ FIXED: MainLayout is now completely public
 */

import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
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
  MessageSquare,
  Bot,
  Map,
  Star,
  Heart,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  HelpCircle,
  Menu,
  X,
  Home,
  LayoutDashboard,
  Dumbbell,
  Sparkles,
  BookMarked,
  Settings,
  LogOut,
  ChevronRight,
  GraduationCap,
  Globe,
  Shield,
  FileText,
  Award,
  Info,
  Headphones,
} from "lucide-react";
import Button from "../components/ui/Button";
import { Card, CardHeader, CardBody, CardFooter } from "../components/ui";
import Badge from "../components/ui/Badge";

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
// 📋 Footer Links Data
// ============================================

const FOOTER_LINKS = {
  quickLinks: [
    { to: "/learn", label: { fa: "مسیر یادگیری", en: "Learning Path" } },
    { to: "/practice", label: { fa: "تمرین‌ها", en: "Practice" } },
    { to: "/ai-tutor", label: { fa: "معلم هوش مصنوعی", en: "AI Tutor" } },
    { to: "/dictionary", label: { fa: "دیکشنری", en: "Dictionary" } },
  ],
  resources: [
    {
      to: "/stories",
      label: { fa: "داستان‌های آلمانی", en: "German Stories" },
    },
    {
      to: "/scenarios",
      label: { fa: "سناریوهای واقعی", en: "Real Scenarios" },
    },
    { to: "/mentors", label: { fa: "منتورهای بومی", en: "Native Mentors" } },
    { to: "/blog", label: { fa: "وبلاگ آموزشی", en: "Blog" } },
  ],
  about: [
    { to: "/about", label: { fa: "درباره ما", en: "About Us" } },
    { to: "/contact", label: { fa: "تماس با ما", en: "Contact Us" } },
    { to: "/faq", label: { fa: "سوالات متداول", en: "FAQ" } },
    { to: "/support", label: { fa: "پشتیبانی", en: "Support" } },
  ],
  rules: [
    { to: "/privacy", label: { fa: "حریم خصوصی", en: "Privacy Policy" } },
    { to: "/terms", label: { fa: "شرایط استفاده", en: "Terms of Service" } },
    { to: "/cookies", label: { fa: "سیاست کوکی", en: "Cookie Policy" } },
    { to: "/disclaimer", label: { fa: "سلب مسئولیت", en: "Disclaimer" } },
  ],
};

// ============================================
// 📊 MainLayout Component - PUBLIC
// ============================================

const MainLayout = () => {
  const { language, toggleLanguage } = useLanguageContext();
  const { isDark, toggleTheme } = useThemeContext();
  const { user, isAuthenticated, logout } = useAuth();
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

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  // ============================================
  // ✅ IMPORTANT: MainLayout is PUBLIC
  // ============================================
  // This layout does NOT redirect to login.
  // Only the PrivateRoute component handles authentication.

  // ============================================
  // 📊 User Dropdown Menu Items
  // ============================================

  const userMenuItems = [
    {
      path: "/profile",
      label: { fa: "پروفایل", en: "Profile" },
      icon: User,
    },
    {
      path: "/settings",
      label: { fa: "تنظیمات", en: "Settings" },
      icon: Settings,
    },
    {
      path: "/about",
      label: { fa: "درباره ما", en: "About Us" },
      icon: Info,
    },
    {
      path: "/contact",
      label: { fa: "تماس با ما", en: "Contact Us" },
      icon: Headphones,
    },
    {
      type: "divider",
    },
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
              aria-label={language === "fa" ? "English" : "فارسی"}
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
              aria-label={isDark ? "Light mode" : "Dark mode"}
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

                {/* ✅ User Dropdown Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                        userMenuOpen ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
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
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
              ) : (
                <Menu className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
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
              transition={{ type: "spring", damping: 25 }}
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

                {/* ✅ Mobile: About & Support/Contact */}
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                >
                  <Info className="w-5 h-5" />
                  <span>{language === "fa" ? "درباره ما" : "About Us"}</span>
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                >
                  <Headphones className="w-5 h-5" />
                  <span>{language === "fa" ? "تماس با ما" : "Contact Us"}</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
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
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 transition"
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

              <div className="mt-8 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <p className="text-xs text-neutral-400 text-center">
                  {language === "fa"
                    ? `آکادمی یادگیری v2.0`
                    : `Learning Academy v2.0`}
                </p>
                <p className="text-xs text-neutral-400 text-center mt-1">
                  {language === "fa"
                    ? "یادگیری آلمانی با هوش مصنوعی"
                    : "Learn German with AI"}
                </p>
              </div>
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

      {/* ========== BACK TO TOP BUTTON ========== */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 transition-colors flex items-center justify-center"
            aria-label={language === "fa" ? "بازگشت به بالا" : "Back to top"}
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ========== FOOTER - 5 COLUMN ========== */}
      <Footer language={language} />
    </div>
  );
};

// ============================================
// 📋 Footer Component - 5 Columns
// ============================================

const Footer = ({ language }) => {
  const { isDark } = useThemeContext();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* ===== COLUMN 1: Learning Academy (Largest - 4 columns) ===== */}
          <div className="md:col-span-4 lg:col-span-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {language === "fa" ? "آکادمی یادگیری" : "Learning Academy"}
                </h3>
                <p className="text-xs text-neutral-500">
                  {language === "fa"
                    ? "یادگیری هوشمند آلمانی"
                    : "Smart German Learning"}
                </p>
              </div>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4 max-w-md">
              {language === "fa"
                ? "پلتفرم رایگان آموزش زبان آلمانی با تمرکز بر مکالمه واقعی، هوش مصنوعی و گیمیفیکیشن."
                : "A free German learning platform focused on real conversation, AI, and gamification."}
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Heart, href: "#", color: "text-red-500" },
                { icon: Star, href: "#", color: "text-amber-500" },
                { icon: Users, href: "#", color: "text-blue-500" },
                { icon: Globe, href: "#", color: "text-green-500" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <a
                    key={i}
                    href={item.href}
                    className={`w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:bg-primary-100 hover:text-primary-500 dark:hover:bg-primary-900 dark:hover:text-primary-400 transition-colors ${item.color}`}
                    aria-label="Social media"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* ===== COLUMN 2: Quick Links (2 columns) ===== */}
          <div className="md:col-span-2 lg:col-span-2">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              {language === "fa" ? "دسترسی سریع" : "Quick Links"}
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.quickLinks.map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.to}
                    className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary-500 transition-colors"
                  >
                    {item.label[language]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== COLUMN 3: Resources (2 columns) ===== */}
          <div className="md:col-span-2 lg:col-span-2">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              {language === "fa" ? "منابع" : "Resources"}
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.resources.map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.to}
                    className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary-500 transition-colors"
                  >
                    {item.label[language]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== COLUMN 4: About Us (2 columns) ===== */}
          <div className="md:col-span-2 lg:col-span-2">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              {language === "fa" ? "درباره ما" : "About Us"}
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.about.map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.to}
                    className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary-500 transition-colors"
                  >
                    {item.label[language]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== COLUMN 5: Rules (2 columns but smaller - half width) ===== */}
          <div className="md:col-span-2 lg:col-span-1">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              {language === "fa" ? "قوانین" : "Rules"}
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.rules.map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.to}
                    className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary-500 transition-colors"
                  >
                    {item.label[language]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ===== Bottom Bar ===== */}
        <div className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
            <p>
              {language === "fa"
                ? `© ${currentYear} آکادمی یادگیری - تمام حقوق محفوظ است`
                : `© ${currentYear} Learning Academy - All rights reserved`}
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="/privacy"
                className="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                {language === "fa" ? "حریم خصوصی" : "Privacy"}
              </Link>
              <Link
                to="/terms"
                className="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                {language === "fa" ? "شرایط استفاده" : "Terms"}
              </Link>
              <Link
                to="/contact"
                className="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                {language === "fa" ? "تماس با ما" : "Contact"}
              </Link>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors shadow-sm"
                aria-label={
                  language === "fa" ? "بازگشت به بالا" : "Back to top"
                }
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MainLayout;
