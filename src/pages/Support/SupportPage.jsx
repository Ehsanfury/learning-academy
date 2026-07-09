/**
 * SupportPage.jsx
 * Path: src/pages/Support/SupportPage.jsx
 * Description: Support page for Learning Academy
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import {
  Mail,
  MessageCircle,
  HelpCircle,
  Send,
  CheckCircle,
} from "lucide-react";
import Card from "@components/ui/Card";
import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import toast from "react-hot-toast";

const SupportPage = () => {
  const { language } = useLanguageContext();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
    toast.success(
      language === "fa"
        ? "پیام شما با موفقیت ارسال شد!"
        : "Your message was sent successfully!",
    );

    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const faqs = [
    {
      question: {
        fa: "چگونه می‌توانم ثبت‌نام کنم؟",
        en: "How can I register?",
      },
      answer: {
        fa: "برای ثبت‌نام، روی دکمه 'شروع یادگیری' در صفحه اصلی کلیک کنید و فرم ثبت‌نام را تکمیل کنید.",
        en: "To register, click the 'Start Learning' button on the homepage and complete the registration form.",
      },
    },
    {
      question: {
        fa: "آیا دوره‌ها رایگان هستند؟",
        en: "Are the courses free?",
      },
      answer: {
        fa: "بله، تمام دوره‌های آموزشی در آکادمی یادگیری کاملاً رایگان هستند.",
        en: "Yes, all courses on Learning Academy are completely free.",
      },
    },
    {
      question: {
        fa: "چگونه می‌توانم پیشرفت خود را ببینم؟",
        en: "How can I see my progress?",
      },
      answer: {
        fa: "با ورود به داشبورد، می‌توانید پیشرفت خود را در درس‌ها، XP و دستاوردها مشاهده کنید.",
        en: "By logging into the dashboard, you can see your progress in lessons, XP and achievements.",
      },
    },
    {
      question: {
        fa: "آیا می‌توانم با معلم صحبت کنم؟",
        en: "Can I talk to a teacher?",
      },
      answer: {
        fa: "بله، از طریق بخش 'منتورها' می‌توانید با منتورهای بومی ارتباط برقرار کنید.",
        en: "Yes, through the 'Mentors' section you can connect with native mentors.",
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
          <HelpCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          {language === "fa" ? "پشتیبانی" : "Support"}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          {language === "fa"
            ? "سوالی دارید؟ ما اینجا هستیم تا کمک کنیم"
            : "Have a question? We're here to help"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card variant="bordered" padding="lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-50 dark:bg-primary-950 rounded-xl">
              <Mail className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                {language === "fa" ? "ایمیل" : "Email"}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                support@german-academy.com
              </p>
            </div>
          </div>
        </Card>

        <Card variant="bordered" padding="lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-50 dark:bg-primary-950 rounded-xl">
              <MessageCircle className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                {language === "fa" ? "پاسخگویی آنلاین" : "Live Chat"}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {language === "fa"
                  ? "شنبه تا پنجشنبه، ۹ صبح تا ۶ عصر"
                  : "Sat to Thu, 9 AM to 6 PM"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          {language === "fa" ? "سوالات متداول" : "Frequently Asked Questions"}
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="bordered" padding="md">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {faq.question[language]}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                  {faq.answer[language]}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          {language === "fa" ? "ارسال پیام" : "Send a Message"}
        </h2>

        {submitted ? (
          <Card variant="bordered" padding="lg" className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {language === "fa" ? "✅ پیام ارسال شد!" : "✅ Message Sent!"}
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400">
              {language === "fa"
                ? "با تشکر از شما. در اسرع وقت پاسخ خواهیم داد."
                : "Thank you. We will respond as soon as possible."}
            </p>
          </Card>
        ) : (
          <Card variant="bordered" padding="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    {language === "fa" ? "نام کامل" : "Full Name"}
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={
                      language === "fa"
                        ? "نام خود را وارد کنید"
                        : "Enter your name"
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    {language === "fa" ? "ایمیل" : "Email"}
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={
                      language === "fa"
                        ? "ایمیل خود را وارد کنید"
                        : "Enter your email"
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  {language === "fa" ? "موضوع" : "Subject"}
                </label>
                <Input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={
                    language === "fa" ? "موضوع پیام" : "Message subject"
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  {language === "fa" ? "پیام" : "Message"}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 outline-none transition"
                  placeholder={
                    language === "fa"
                      ? "پیام خود را بنویسید..."
                      : "Write your message..."
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={Send}
                fullWidth
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {language === "fa" ? "ارسال پیام" : "Send Message"}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </motion.div>
  );
};

export default SupportPage;
