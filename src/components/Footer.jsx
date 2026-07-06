/**
 * Footer.jsx
 * Path: src/components/Footer.jsx
 * Description: Footer component with rounded corners
 * Version: 2.0 - Improved with rounded corners
 */

import { Link } from "react-router-dom";
import { useLanguageContext } from "@context/LanguageContext";
import { useThemeContext } from "@context/ThemeContext";
import { ArrowUp, Heart, Star, Users } from "lucide-react";

function Footer() {
  const { language } = useLanguageContext();
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
    <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 rounded-t-3xl mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Footer */}
        <div className="hidden md:block py-12 lg:py-16">
          <div className="grid grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
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

            {/* Links Columns */}
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
              <div className="w-6 h-6 bg-primary-500 rounded-xl flex items-center justify-center">
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
}

export default Footer;
