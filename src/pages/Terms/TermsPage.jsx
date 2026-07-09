/**
 * TermsPage.jsx
 * Path: src/pages/Terms/TermsPage.jsx
 * Description: Terms of Service page
 */

import React from "react";
import { motion } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import { FileText, CheckCircle } from "lucide-react";
import Card from "@components/ui/Card";

const TermsPage = () => {
  const { language } = useLanguageContext();

  const sections = [
    {
      title: {
        fa: "پذیرش شرایط",
        en: "Acceptance of Terms",
      },
      content: {
        fa: "با استفاده از آکادمی یادگیری، شما موافقت می‌کنید که از این شرایط استفاده پیروی کنید. اگر با این شرایط موافق نیستید، لطفاً از سایت استفاده نکنید.",
        en: "By using Learning Academy, you agree to comply with these terms of use. If you do not agree to these terms, please do not use the site.",
      },
    },
    {
      title: {
        fa: "حساب کاربری",
        en: "User Account",
      },
      content: {
        fa: "برای استفاده از برخی خدمات، باید یک حساب کاربری ایجاد کنید. شما مسئول حفظ امنیت اطلاعات حساب خود هستید و تمام فعالیت‌های انجام شده با حساب شما به عهده شماست.",
        en: "To use some services, you must create a user account. You are responsible for maintaining the security of your account information and all activities conducted with your account.",
      },
    },
    {
      title: {
        fa: "محتوای آموزشی",
        en: "Educational Content",
      },
      content: {
        fa: "تمامی محتوای آموزشی ارائه شده در آکادمی یادگیری برای استفاده شخصی و غیرتجاری طراحی شده است. کپی‌برداری، توزیع یا فروش محتوا بدون اجازه کتبی ممنوع است.",
        en: "All educational content provided on Learning Academy is designed for personal and non-commercial use. Copying, distributing or selling content without written permission is prohibited.",
      },
    },
    {
      title: {
        fa: "رفتار کاربران",
        en: "User Conduct",
      },
      content: {
        fa: "کاربران موظفند:\n• به سایر کاربران احترام بگذارند\n• از ارسال محتوای نامناسب خودداری کنند\n• از سیستم به صورت قانونی استفاده کنند\n• در مکالمات با هوش مصنوعی ادب را رعایت کنند",
        en: "Users must:\n• Respect other users\n• Refrain from posting inappropriate content\n• Use the system legally\n• Be polite in AI conversations",
      },
    },
    {
      title: {
        fa: "مسئولیت‌ها",
        en: "Responsibilities",
      },
      content: {
        fa: "آکادمی یادگیری سعی می‌کند محتوای دقیق و به‌روز ارائه دهد، اما مسئولیتی در قبال دقت کامل محتوا ندارد. کاربران مسئول بررسی و تأیید محتوای آموزشی هستند.",
        en: "Learning Academy strives to provide accurate and up-to-date content, but is not responsible for complete accuracy. Users are responsible for verifying educational content.",
      },
    },
    {
      title: {
        fa: "تغییرات شرایط",
        en: "Changes to Terms",
      },
      content: {
        fa: "ما ممکن است این شرایط را در هر زمان تغییر دهیم. تغییرات در این صفحه منتشر می‌شوند و استفاده مستمر شما از سایت به منزله پذیرش تغییرات است.",
        en: "We may change these terms at any time. Changes will be posted on this page and your continued use of the site constitutes acceptance of the changes.",
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-4 py-12"
    >
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          {language === "fa" ? "شرایط استفاده" : "Terms of Service"}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          {language === "fa"
            ? "قوانین و مقررات استفاده از آکادمی یادگیری"
            : "Rules and regulations for using Learning Academy"}
        </p>
        <p className="text-xs text-neutral-400 mt-4">
          {language === "fa"
            ? "آخرین به‌روزرسانی: تیر ۱۴۰۵"
            : "Last updated: July 2026"}
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-neutral-600 dark:text-neutral-300">
          {language === "fa"
            ? "خوش آمدید به آکادمی یادگیری. با استفاده از این سایت، شما موافقت می‌کنید که از شرایط و مقررات زیر پیروی کنید."
            : "Welcome to Learning Academy. By using this site, you agree to comply with the following terms and conditions."}
        </p>

        {sections.map((section, index) => (
          <Card key={index} variant="bordered" padding="lg" className="mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary-500" />
              {section.title[language]}
            </h2>
            <div className="text-sm text-neutral-600 dark:text-neutral-300 whitespace-pre-line">
              {section.content[language]}
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default TermsPage;
