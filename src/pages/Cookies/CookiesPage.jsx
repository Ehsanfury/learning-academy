/**
 * CookiesPage.jsx
 * Path: src/pages/Cookies/CookiesPage.jsx
 * Description: Cookie Policy page
 */

import React from "react";
import { motion } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import { Cookie, Shield, CheckCircle, Info } from "lucide-react";
import Card from "@components/ui/Card";

const CookiesPage = () => {
  const { language } = useLanguageContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-4 py-12"
    >
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Cookie className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          {language === "fa" ? "سیاست کوکی" : "Cookie Policy"}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          {language === "fa"
            ? "نحوه استفاده از کوکی‌ها در آکادمی یادگیری"
            : "How we use cookies on Learning Academy"}
        </p>
        <p className="text-xs text-neutral-400 mt-4">
          {language === "fa"
            ? "آخرین به‌روزرسانی: تیر ۱۴۰۵"
            : "Last updated: July 2026"}
        </p>
      </div>

      <div className="space-y-4">
        <Card variant="bordered" padding="lg">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
            <Cookie className="w-5 h-5 text-primary-500" />
            {language === "fa" ? "کوکی چیست؟" : "What are Cookies?"}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {language === "fa"
              ? "کوکی‌ها فایل‌های متنی کوچکی هستند که توسط وب‌سایت‌ها بر روی دستگاه شما ذخیره می‌شوند. این فایل‌ها به وب‌سایت کمک می‌کنند تا اطلاعاتی درباره بازدید شما ذخیره کند و تجربه کاربری بهتری ارائه دهد."
              : "Cookies are small text files that websites store on your device. These files help the website remember information about your visit and provide a better user experience."}
          </p>
        </Card>

        <Card variant="bordered" padding="lg">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            {language === "fa"
              ? "انواع کوکی‌هایی که استفاده می‌کنیم"
              : "Types of Cookies We Use"}
          </h2>
          <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                {language === "fa"
                  ? "🔐 کوکی‌های ضروری"
                  : "🔐 Essential Cookies"}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {language === "fa"
                  ? "این کوکی‌ها برای عملکرد صحیح سایت ضروری هستند و قابل غیرفعال‌سازی نیستند. شامل کوکی‌های احراز هویت و امنیت می‌شوند."
                  : "These cookies are essential for the proper functioning of the site and cannot be disabled. They include authentication and security cookies."}
              </p>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                {language === "fa"
                  ? "📊 کوکی‌های تحلیلی"
                  : "📊 Analytical Cookies"}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {language === "fa"
                  ? "این کوکی‌ها به ما کمک می‌کنند تا نحوه استفاده کاربران از سایت را درک کنیم و تجربه کاربری را بهبود بخشیم."
                  : "These cookies help us understand how users interact with the site and improve the user experience."}
              </p>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                {language === "fa"
                  ? "⚙️ کوکی‌های تنظیمات"
                  : "⚙️ Preference Cookies"}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {language === "fa"
                  ? "این کوکی‌ها تنظیمات شما مانند زبان و تم را ذخیره می‌کنند تا در بازدیدهای بعدی نیازی به تنظیم مجدد نداشته باشید."
                  : "These cookies remember your preferences like language and theme so you don't have to set them again on future visits."}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="bordered" padding="lg">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            {language === "fa" ? "مدیریت کوکی‌ها" : "Managing Cookies"}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {language === "fa"
              ? "شما می‌توانید کوکی‌ها را از طریق تنظیمات مرورگر خود مدیریت یا حذف کنید. لطفاً توجه داشته باشید که غیرفعال‌سازی برخی کوکی‌ها ممکن است بر عملکرد صحیح سایت تأثیر بگذارد."
              : "You can manage or delete cookies through your browser settings. Please note that disabling certain cookies may affect the proper functioning of the site."}
          </p>
        </Card>

        <Card variant="bordered" padding="lg">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            {language === "fa" ? "کوکی‌های شخص ثالث" : "Third-Party Cookies"}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {language === "fa"
              ? "ما از خدمات شخص ثالث مانند Google Analytics برای تحلیل استفاده می‌کنیم. این خدمات ممکن است کوکی‌های خود را بر روی دستگاه شما ذخیره کنند. ما کنترل کاملی بر این کوکی‌ها نداریم."
              : "We use third-party services like Google Analytics for analysis. These services may store their own cookies on your device. We do not have complete control over these cookies."}
          </p>
        </Card>

        <Card variant="bordered" padding="lg">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            {language === "fa"
              ? "تغییرات در سیاست کوکی"
              : "Changes to Cookie Policy"}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {language === "fa"
              ? "ما ممکن است این سیاست را در هر زمان به‌روزرسانی کنیم. تغییرات در این صفحه منتشر می‌شوند و استفاده مستمر شما از سایت به منزله پذیرش تغییرات است."
              : "We may update this policy at any time. Changes will be posted on this page and your continued use of the site constitutes acceptance of the changes."}
          </p>
        </Card>

        <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
          <p className="text-xs text-neutral-500">
            {language === "fa"
              ? "اگر سوالی درباره سیاست کوکی دارید، با ما تماس بگیرید."
              : "If you have any questions about our cookie policy, please contact us."}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default CookiesPage;
