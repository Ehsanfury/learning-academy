/**
 * AboutPage.jsx
 * Path: src/pages/About/AboutPage.jsx
 * Description: About page with developer information
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
  Code,
  Github,
  Bot,
  Award,
} from "lucide-react";
import Card from "@components/ui/Card";
import Badge from "@components/ui/Badge";

const AboutPage = () => {
  const { language } = useLanguageContext();

  const teamMembers = [
    {
      name: "احسان محمودی",
      role: { fa: "توسعه‌دهنده ارشد", en: "Lead Developer" },
      education: {
        fa: "مهندسی حرفه‌ای کامپیوتر",
        en: "Professional Computer Engineering",
      },
      skills: [
        "HTML",
        "CSS",
        "JavaScript (متوسط)",
        "React (مبتدی)",
        "WordPress",
        "Git & GitHub (متوسط)",
      ],
      bio: {
        fa: "علاقه‌مند به توسعه وب و یادگیری ماشین. این پروژه با هدف کمک به زبان‌آموزان آلمانی ساخته شده است.",
        en: "Passionate about web development and machine learning. This project was built to help German language learners.",
      },
    },
  ];

  const aiTools = [
    {
      name: "GLM 5.2",
      description: {
        fa: "برای تولید محتوای آموزشی و تحلیل داده‌ها",
        en: "For generating educational content and data analysis",
      },
      icon: Sparkles,
    },
    {
      name: "DeepSeek",
      description: {
        fa: "برای کدنویسی، رفع باگ‌ها و بهینه‌سازی کد",
        en: "For coding, debugging and code optimization",
      },
      icon: Code,
    },
    {
      name: "ChatGPT",
      description: {
        fa: "برای تولید محتوای متنی و ایده‌پردازی",
        en: "For content generation and ideation",
      },
      icon: Bot,
    },
  ];

  const features = [
    {
      icon: BookOpen,
      title: { fa: "۱۲ درس تعاملی", en: "12 Interactive Lessons" },
      description: {
        fa: "درس‌های ساختاریافته از A1 تا سطح پیشرفته",
        en: "Structured lessons from A1 to advanced levels",
      },
    },
    {
      icon: Sparkles,
      title: { fa: "هوش مصنوعی", en: "AI Powered" },
      description: {
        fa: "معلم هوش مصنوعی با قابلیت تصحیح مکالمه",
        en: "AI tutor with conversation correction capabilities",
      },
    },
    {
      icon: Users,
      title: { fa: "جامعه یادگیری", en: "Learning Community" },
      description: {
        fa: "ارتباط با سایر زبان‌آموزان و منتورها",
        en: "Connect with other learners and mentors",
      },
    },
    {
      icon: Shield,
      title: { fa: "پیشرفت واقعی", en: "Real Progress" },
      description: {
        fa: "سیستم پیشرفت با دریافت XP و دستاوردها",
        en: "Progress system with XP and achievements",
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      {/* Header */}
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

      {/* Project Description */}
      <Card variant="bordered" padding="lg" className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          {language === "fa" ? "داستان این پروژه" : "Project Story"}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
          {language === "fa"
            ? "آکادمی یادگیری یک پلتفرم آموزشی رایگان است که با هدف کمک به زبان‌آموزان آلمانی طراحی شده است. این پروژه با ترکیب تکنولوژی‌های مدرن مانند هوش مصنوعی، گیمیفیکیشن و محتوای تعاملی، تجربه‌ای لذت‌بخش و مؤثر از یادگیری زبان را ارائه می‌دهد."
            : "Learning Academy is a free educational platform designed to help German language learners. This project combines modern technologies like AI, gamification and interactive content to provide an enjoyable and effective language learning experience."}
        </p>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {features.map((feature, index) => (
          <Card key={index} variant="bordered" padding="md">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary-50 dark:bg-primary-950 rounded-xl">
                <feature.icon className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {feature.title[language]}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {feature.description[language]}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Team */}
      <Card variant="bordered" padding="lg" className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          {language === "fa" ? "تیم توسعه" : "Development Team"}
        </h2>

        {teamMembers.map((member, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row gap-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl"
          >
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center text-3xl font-bold text-white">
                {member.name.charAt(0)}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {member.name}
              </h3>
              <p className="text-sm text-primary-500">
                {member.role[language]}
              </p>
              <p className="text-sm text-neutral-500">
                {member.education[language]}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {member.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" size="sm">
                    {skill}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                {member.bio[language]}
              </p>
            </div>
          </div>
        ))}
      </Card>

      {/* AI Tools */}
      <Card variant="bordered" padding="lg" className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-500" />
          {language === "fa" ? "هوش مصنوعی‌های کمک‌کننده" : "AI Assistants"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {aiTools.map((tool, index) => (
            <div
              key={index}
              className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center"
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950 rounded-xl flex items-center justify-center mx-auto mb-3">
                <tool.icon className="w-6 h-6 text-purple-500" />
              </div>
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                {tool.name}
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {tool.description[language]}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center p-6 bg-neutral-50 dark:bg-neutral-800 rounded-2xl">
        <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {language === "fa"
            ? "ساخته شده با ❤️ برای زبان‌آموزان آلمانی"
            : "Made with ❤️ for German language learners"}
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          {language === "fa" ? "نسخه ۲.۰ - ۲۰۲۶" : "Version 2.0 - 2026"}
        </p>
      </div>
    </motion.div>
  );
};

export default AboutPage;
