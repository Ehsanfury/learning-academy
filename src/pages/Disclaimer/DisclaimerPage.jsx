/**
 * DisclaimerPage.jsx
 * Path: src/pages/Disclaimer/DisclaimerPage.jsx
 * Description: Disclaimer page
 */

import React from "react";
import { motion } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import { AlertTriangle, Shield, CheckCircle } from "lucide-react";
import Card from "@components/ui/Card";

const DisclaimerPage = () => {
  const { language } = useLanguageContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-4 py-12"
    >
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          {language === "fa" ? "سلب مسئولیت" : "Disclaimer"}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          {language === "fa"
            ? "اطلاعات مهم درباره استفاده از این سایت"
            : "Important information about using this site"}
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
            <Shield className="w-5 h-5 text-amber-500" />
            {language === "fa" ? "۱. محتوای آموزشی" : "1. Educational Content"}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {language === "fa"
              ? "تمامی محتوای آموزشی ارائه شده در آکادمی یادگیری صرفاً برای اهداف آموزشی و اطلاع‌رسانی طراحی شده است. ما سعی می‌کنیم اطلاعات دقیق و به‌روز ارائه دهیم، اما مسئولیتی در قبال صحت کامل یا عدم وجود خطا در محتوا نداریم."
              : "All educational content provided on Learning Academy is designed solely for educational and informational purposes. We strive to provide accurate and up-to-date information, but we are not responsible for complete accuracy or the absence of errors in the content."}
          </p>
        </Card>

        <Card variant="bordered" padding="lg">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {language === "fa" ? "۲. نتایج یادگیری" : "2. Learning Outcomes"}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {language === "fa"
              ? "نتایج یادگیری هر فرد به عوامل مختلفی مانند زمان مطالعه، تلاش، روش‌های یادگیری و توانایی‌های شخصی بستگی دارد. آکادمی یادگیری تضمین نمی‌کند که همه کاربران به یک سطح از تسلط زبانی دست پیدا کنند."
              : "Learning outcomes vary based on factors such as study time, effort, learning methods and personal abilities. Learning Academy does not guarantee that all users will achieve the same level of language proficiency."}
          </p>
        </Card>

        <Card variant="bordered" padding="lg">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            {language === "fa" ? "۳. هوش مصنوعی" : "3. Artificial Intelligence"}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {language === "fa"
              ? "پاسخ‌های ارائه شده توسط هوش مصنوعی ممکن است شامل خطا یا نادقیقی باشد. ما توصیه می‌کنیم همیشه اطلاعات را با منابع معتبر دیگر نیز بررسی کنید. هوش مصنوعی یک ابزار کمکی است و نباید به عنوان منبع اصلی یادگیری در نظر گرفته شود."
              : "Responses provided by artificial intelligence may contain errors or inaccuracies. We recommend always cross-checking information with other reliable sources. AI is a supplementary tool and should not be considered as the primary learning source."}
          </p>
        </Card>

        <Card variant="bordered" padding="lg">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {language === "fa" ? "۴. لینک‌های خارجی" : "4. External Links"}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {language === "fa"
              ? "آکادمی یادگیری ممکن است حاوی لینک‌هایی به سایت‌های خارجی باشد. ما مسئولیتی در قبال محتوا، دقت یا سیاست‌های حریم خصوصی این سایت‌ها نداریم. ورود به این لینک‌ها با مسئولیت خود کاربر است."
              : "Learning Academy may contain links to external sites. We are not responsible for the content, accuracy or privacy policies of these sites. Accessing these links is at the user's own risk."}
          </p>
        </Card>

        <Card variant="bordered" padding="lg">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            {language === "fa" ? "۵. پذیرش شرایط" : "5. Acceptance of Terms"}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {language === "fa"
              ? "با استفاده از آکادمی یادگیری، شما می‌پذیرید که این سلب مسئولیت را خوانده و با آن موافقت کرده‌اید. اگر با هر یک از شرایط فوق موافق نیستید، لطفاً از این سایت استفاده نکنید."
              : "By using Learning Academy, you acknowledge that you have read and agree to this disclaimer. If you do not agree with any of the above terms, please do not use this site."}
          </p>
        </Card>

        <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
          <p className="text-xs text-neutral-500">
            {language === "fa"
              ? "برای اطلاعات بیشتر، با ما تماس بگیرید."
              : "For more information, please contact us."}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default DisclaimerPage;
