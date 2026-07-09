/**
 * FAQPage.jsx
 * Path: src/pages/FAQ/FAQPage.jsx
 * Description: Frequently Asked Questions
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import Card from "@components/ui/Card";

const FAQPage = () => {
  const { language } = useLanguageContext();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: {
        fa: "آکادمی یادگیری چیست؟",
        en: "What is Learning Academy?",
      },
      answer: {
        fa: "آکادمی یادگیری یک پلتفرم آموزشی رایگان برای یادگیری زبان آلمانی است. این پلتفرم با استفاده از هوش مصنوعی، گیمیفیکیشن و محتوای تعاملی، تجربه‌ای لذت‌بخش از یادگیری زبان را ارائه می‌دهد.",
        en: "Learning Academy is a free educational platform for learning German. It uses AI, gamification and interactive content to provide an enjoyable language learning experience.",
      },
    },
    {
      question: {
        fa: "آیا ثبت‌نام در آکادمی یادگیری رایگان است؟",
        en: "Is Learning Academy free to register?",
      },
      answer: {
        fa: "بله، تمام دوره‌های آموزشی در آکادمی یادگیری کاملاً رایگان هستند. شما می‌توانید بدون هیچ هزینه‌ای ثبت‌نام کنید و از تمام محتواها استفاده کنید.",
        en: "Yes, all courses on Learning Academy are completely free. You can register and access all content without any cost.",
      },
    },
    {
      question: {
        fa: "چگونه می‌توانم پیشرفت خود را ببینم؟",
        en: "How can I see my progress?",
      },
      answer: {
        fa: "با ورود به داشبورد کاربری، می‌توانید پیشرفت خود را در درس‌ها، امتیاز XP، دستاوردها و گل‌زنی روزانه مشاهده کنید. همچنین نمودارهای پیشرفت و آمار دقیق در دسترس شماست.",
        en: "By logging into your dashboard, you can see your progress in lessons, XP points, achievements and daily streaks. Progress charts and detailed statistics are also available.",
      },
    },
    {
      question: {
        fa: "آیا می‌توانم با هوش مصنوعی مکالمه کنم؟",
        en: "Can I chat with AI?",
      },
      answer: {
        fa: "بله، بخش 'معلم هوش مصنوعی' به شما امکان می‌دهد تا به صورت کاملاً طبیعی با هوش مصنوعی مکالمه کنید. هوش مصنوعی تلفظ، گرامر و جمله‌سازی شما را تصحیح می‌کند.",
        en: "Yes, the 'AI Tutor' section allows you to have natural conversations with AI. The AI corrects your pronunciation, grammar and sentence structure.",
      },
    },
    {
      question: {
        fa: "چند درس در آکادمی یادگیری وجود دارد؟",
        en: "How many lessons are there in Learning Academy?",
      },
      answer: {
        fa: "در حال حاضر ۵ درس کامل در سطح A1 موجود است و درس‌های بیشتری در حال تولید هستند. هر درس شامل بخش‌های مختلفی مانند واژگان، گرامر، تمرین و آزمون است.",
        en: "Currently, 5 complete lessons at A1 level are available and more lessons are being produced. Each lesson includes vocabulary, grammar, exercises and assessments.",
      },
    },
    {
      question: {
        fa: "چگونه می‌توانم با منتورها ارتباط برقرار کنم؟",
        en: "How can I connect with mentors?",
      },
      answer: {
        fa: "از طریق بخش 'منتورها' می‌توانید با منتورهای بومی آلمانی زبان ارتباط برقرار کنید. منتورها به شما در تمرین مکالمه و رفع اشکالات زبانی کمک می‌کنند.",
        en: "Through the 'Mentors' section, you can connect with native German mentors. Mentors help you with conversation practice and language correction.",
      },
    },
    {
      question: {
        fa: "آیا گواهی پایان دوره ارائه می‌شود؟",
        en: "Is a certificate provided upon completion?",
      },
      answer: {
        fa: "در حال حاضر گواهی رسمی ارائه نمی‌شود، اما با تکمیل هر درس، امتیاز و دستاوردهای مربوطه را دریافت می‌کنید که نشان‌دهنده پیشرفت شماست.",
        en: "Currently, no official certificate is provided, but by completing each lesson you will receive XP points and achievements that reflect your progress.",
      },
    },
    {
      question: {
        fa: "آیا برنامه موبایل هم دارید؟",
        en: "Do you have a mobile app?",
      },
      answer: {
        fa: "در حال حاضر برنامه موبایل اختصاصی نداریم، اما سایت به صورت کاملاً ریسپانسیو طراحی شده و در تمام دستگاه‌ها قابل استفاده است.",
        en: "Currently, we don't have a dedicated mobile app, but the site is fully responsive and works on all devices.",
      },
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-4 py-12"
    >
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <HelpCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          {language === "fa" ? "سوالات متداول" : "Frequently Asked Questions"}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          {language === "fa"
            ? "پاسخ به سوالات رایج شما"
            : "Answers to your common questions"}
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              variant="bordered"
              padding="md"
              className={`cursor-pointer transition-all ${
                openIndex === index
                  ? "border-primary-500 dark:border-primary-400"
                  : ""
              }`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {faq.question[language]}
                </h3>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-1" />
                )}
              </div>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                      {faq.answer[language]}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default FAQPage;
