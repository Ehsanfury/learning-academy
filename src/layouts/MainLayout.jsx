/**
 * MainLayout.jsx
 * Path: src/layouts/MainLayout.jsx
 * Description: Main layout with responsive navbar and mobile support
 * Project: Learning Academy
 * Version: 2.0 - Fixed imports
 */

import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// ✅ FIXED: Changed @context to relative path
import { useLanguageContext } from "../context/LanguageContext";
import { useThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
// ✅ FIXED: Changed @hooks to relative path
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
} from "lucide-react";

// ✅ FIXED: Changed @components to relative path
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
// 📊 MainLayout Component
// ============================================

const MainLayout = () => {
  const { language, toggleLanguage } = useLanguageContext();
  const { isDark, toggleTheme } = useThemeContext();
  const { user, isAuthenticated, logout } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // ============================================
  // 🎯 Scroll to top button visibility
  // ============================================

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ============================================
  // 🚫 Close mobile menu on route change
  // ============================================

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // ============================================
  // 🛠️ Handlers
  // ============================================

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  // ============================================
  // 🖼️ Render
  // ============================================

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
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {language === "fa" ? "خروج" : "Logout"}
                </button>
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

                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                >
                  <Settings className="w-5 h-5" />
                  <span>{language === "fa" ? "تنظیمات" : "Settings"}</span>
                </Link>

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

      {/* ========== FOOTER ========== */}
      <Footer language={language} />
    </div>
  );
};

// ============================================
// 📋 Footer Component
// ============================================

const Footer = ({ language }) => {
  const { isDark } = useThemeContext();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: { fa: "دسترسی سریع", en: "Quick Links" },
      items: [
        { to: "/learn", label: { fa: "مسیر یادگیری", en: "Learning Path" } },
        { to: "/practice", label: { fa: "تمرین‌ها", en: "Practice" } },
        { to: "/ai-tutor", label: { fa: "معلم هوش مصنوعی", en: "AI Tutor" } },
        { to: "/dictionary", label: { fa: "دیکشنری", en: "Dictionary" } },
      ],
    },
    {
      title: { fa: "منابع", en: "Resources" },
      items: [
        {
          to: "/stories",
          label: { fa: "داستان‌های آلمانی", en: "German Stories" },
        },
        {
          to: "/scenarios",
          label: { fa: "سناریوهای واقعی", en: "Real Scenarios" },
        },
        {
          to: "/mentors",
          label: { fa: "منتورهای بومی", en: "Native Mentors" },
        },
        { to: "/blog", label: { fa: "وبلاگ آموزشی", en: "Blog" } },
      ],
    },
    {
      title: { fa: "پشتیبانی", en: "Support" },
      items: [
        { to: "/faq", label: { fa: "سوالات متداول", en: "FAQ" } },
        { to: "/contact", label: { fa: "تماس با ما", en: "Contact" } },
        { to: "/privacy", label: { fa: "حریم خصوصی", en: "Privacy" } },
        { to: "/terms", label: { fa: "شرایط استفاده", en: "Terms" } },
      ],
    },
  ];

  return (
    <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Footer */}
        <div className="hidden md:block py-12 lg:py-16">
          <div className="grid grid-cols-4 gap-8 lg:gap-12">
            <div>
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
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
                {language === "fa"
                  ? "پلتفرم رایگان آموزش زبان آلمانی با تمرکز بر مکالمه واقعی، هوش مصنوعی و گیمیفیکیشن."
                  : "A free German learning platform focused on real conversation, AI, and gamification."}
              </p>
              <div className="flex items-center gap-3">
                {[
                  { icon: Heart, href: "#" },
                  { icon: Star, href: "#" },
                  { icon: Users, href: "#" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={i}
                      href={item.href}
                      className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:bg-primary-100 hover:text-primary-500 dark:hover:bg-primary-900 dark:hover:text-primary-400 transition-colors"
                      aria-label="Social media"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {footerLinks.map((column, idx) => (
              <div key={idx}>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  {column.title[language]}
                </h4>
                <ul className="space-y-2.5">
                  {column.items.map((item, i) => (
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
            ))}
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="md:hidden py-6">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">L</span>
              </div>
              <span className="text-sm text-neutral-500">
                {language === "fa"
                  ? `© ${currentYear} آکادمی یادگیری`
                  : `© ${currentYear} Learning Academy`}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-400">
              <Link to="/" className="hover:text-neutral-600 transition-colors">
                {language === "fa" ? "خانه" : "Home"}
              </Link>
              <span>•</span>
              <Link
                to="/learn"
                className="hover:text-neutral-600 transition-colors"
              >
                {language === "fa" ? "یادگیری" : "Learn"}
              </Link>
              <span>•</span>
              <Link
                to="/login"
                className="hover:text-neutral-600 transition-colors"
              >
                {language === "fa" ? "ورود" : "Login"}
              </Link>
              <span>•</span>
              <Link
                to="/privacy"
                className="hover:text-neutral-600 transition-colors"
              >
                {language === "fa" ? "حریم خصوصی" : "Privacy"}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400">
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