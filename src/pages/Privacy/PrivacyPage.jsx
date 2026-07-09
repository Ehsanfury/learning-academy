/**
 * PrivacyPage.jsx
 * Path: src/pages/Privacy/PrivacyPage.jsx
 * Description: Privacy Policy page
 */

import React from "react";
import { motion } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import { Shield, CheckCircle } from "lucide-react";
import Card from "@components/ui/Card";

const PrivacyPage = () => {
  const { language } = useLanguageContext();

  const sections = [
    {
      title: {
        fa: "اطلاعات جمع‌آوری شده",
        en: "Information Collected",
      },
      content: {
        fa: "ما اطلاعات زیر را از شما جمع‌آوری می‌کنیم:\n• نام و ایمیل\n• اطلاعات مربوط به پیشرفت یادگیری\n• اطلاعاتی که در مکالمات با هوش مصنوعی ارائه می‌دهید\n• داده‌های استفاده از سایت",
        en: "We collect the following information from you:\n• Name and email\n• Learning progress data\n• Information you provide in AI conversations\n• Site usage data",
      },
    },
    {
      title: {
        fa: "چگونه از اطلاعات شما استفاده می‌کنیم؟",
        en: "How We Use Your Information",
      },
      content: {
        fa: "اطلاعات شما برای:\n• ارائه خدمات آموزشی شخصی‌سازی شده\n• بهبود محتوای آموزشی\n• ارتباط با شما در مورد به‌روزرسانی‌ها\n• تحلیل و بهبود عملکرد سایت\nاستفاده می‌شود.",
        en: "Your information is used for:\n• Providing personalized educational services\n• Improving educational content\n• Communicating with you about updates\n• Analyzing and improving site performance",
      },
    },
    {
      title: {
        fa: "اشتراک‌گذاری اطلاعات",
        en: "Information Sharing",
      },
      content: {
        fa: "ما اطلاعات شخصی شما را با هیچ شخص ثالثی به اشتراک نمی‌گذاریم، مگر در موارد زیر:\n• با رضایت صریح شما\n• برای رعایت قوانین و مقررات\n• برای محافظت از حقوق و امنیت کاربران",
        en: "We do not share your personal information with any third parties, except:\n• With your explicit consent\n• To comply with laws and regulations\n• To protect user rights and security",
      },
    },
    {
      title: {
        fa: "امنیت داده‌ها",
        en: "Data Security",
      },
      content: {
        fa: "ما از پروتکل‌های امنیتی استاندارد برای محافظت از اطلاعات شما استفاده می‌کنیم:\n• رمزگذاری داده‌ها در انتقال (SSL/TLS)\n• ذخیره‌سازی امن اطلاعات\n• محدودیت دسترسی به اطلاعات\n• به‌روزرسانی منظم سیستم‌های امنیتی",
        en: "We use standard security protocols to protect your information:\n• Data encryption in transit (SSL/TLS)\n• Secure data storage\n• Restricted access to information\n• Regular security system updates",
      },
    },
    {
      title: {
        fa: "حقوق شما",
        en: "Your Rights",
      },
      content: {
        fa: "شما حق دارید:\n• به اطلاعات خود دسترسی داشته باشید\n• اطلاعات خود را اصلاح کنید\n• درخواست حذف اطلاعات خود کنید\n• از دریافت ایمیل‌های تبلیغاتی انصراف دهید",
        en: "You have the right to:\n• Access your information\n• Correct your information\n• Request deletion of your information\n• Opt out of promotional emails",
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
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          {language === "fa" ? "حریم خصوصی" : "Privacy Policy"}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          {language === "fa"
            ? "چگونه از اطلاعات شما محافظت می‌کنیم"
            : "How we protect your information"}
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
            ? "حریم خصوصی شما برای ما مهم است. این سیاست حریم خصوصی نحوه جمع‌آوری، استفاده و محافظت از اطلاعات شما را توضیح می‌دهد."
            : "Your privacy is important to us. This privacy policy explains how we collect, use and protect your information."}
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

        <div className="mt-8 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
          <p className="text-xs text-neutral-500">
            {language === "fa"
              ? "اگر سوالی در مورد حریم خصوصی دارید، با ما تماس بگیرید."
              : "If you have any questions about privacy, please contact us."}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyPage;
