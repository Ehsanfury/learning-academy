/**
 * AboutPage.jsx
 * Path: src/pages/About/AboutPage.jsx
 * Description: About page for Learning Academy
 */

import React from "react";
import { motion } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import {
  GraduationCap,
  Users,
  BookOpen,
  Sparkles,
  Shield,
  Heart,
} from "lucide-react";
import Card from "@components/ui/Card";

const AboutPage = () => {
  const { language } = useLanguageContext();

  const features = [
    {
      icon: BookOpen,
      title: { fa: "یادگیری تعاملی", en: "Interactive Learning" },
      description: {
        fa: "درس‌های تعاملی با تمرینات متنوع و بازخورد فوری",
        en: "Interactive lessons with diverse exercises and instant feedback",
      },
    },
    {
      icon: Sparkles,
      title: { fa: "هوش مصنوعی", en: "AI Powered" },
      description: {
        fa: "معلم هوش مصنوعی برای تمرین مکالمه و رفع اشکال",
        en: "AI tutor for conversation practice and error correction",
      },
    },
    {
      icon: Users,
      title: { fa: "جامعه یادگیری", en: "Learning Community" },
      description: {
        fa: "ارتباط با سایر زبان‌آموزان و منتورهای بومی",
        en: "Connect with other learners and native mentors",
      },
    },
    {
      icon: Shield,
      title: { fa: "پیشرفت واقعی", en: "Real Progress" },
      description: {
        fa: "سیستم پیشرفت و دریافت XP برای هر فعالیت آموزشی",
        en: "Progress system and XP rewards for every learning activity",
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          {language === "fa"
            ? "درباره آکادمی یادگیری"
            : "About Learning Academy"}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2 max-w-2xl mx-auto">
          {language === "fa"
            ? "پلتفرمی برای یادگیری زبان آلمانی با روش‌های نوین و هوشمند"
            : "A platform for learning German with modern and smart methods"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {features.map((feature, index) => (
          <Card key={index} variant="bordered" padding="lg" hover>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-50 dark:bg-primary-950 rounded-xl">
                <feature.icon className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {feature.title[language]}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {feature.description[language]}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-6 bg-neutral-50 dark:bg-neutral-800 rounded-2xl text-center">
        <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-neutral-600 dark:text-neutral-300">
          {language === "fa"
            ? "ساخته شده با ❤️ برای زبان‌آموزان آلمانی"
            : "Made with ❤️ for German language learners"}
        </p>
        <p className="text-xs text-neutral-400 mt-2">
          {language === "fa" ? "نسخه ۲.۰ - ۲۰۲۶" : "Version 2.0 - 2026"}
        </p>
      </div>
    </motion.div>
  );
};

export default AboutPage;
