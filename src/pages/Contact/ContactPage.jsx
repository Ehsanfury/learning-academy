/**
 * ContactPage.jsx
 * Path: src/pages/Contact/ContactPage.jsx
 * Description: Contact page with form and information
 * Changes:
 * - ✅ FIXED: Email changed to ehsansteam79@gmail.com
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import {
  Mail,
  MessageCircle,
  Send,
  CheckCircle,
  MapPin,
  Phone,
} from "lucide-react";
import Card from "@components/ui/Card";
import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import toast from "react-hot-toast";

const ContactPage = () => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          {language === "fa" ? "تماس با ما" : "Contact Us"}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          {language === "fa"
            ? "ما اینجا هستیم تا به شما کمک کنیم"
            : "We're here to help you"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card variant="bordered" padding="md" className="text-center">
          <Mail className="w-8 h-8 text-primary-500 mx-auto mb-2" />
          <h3 className="font-semibold text-sm">Email</h3>
          <p className="text-xs text-neutral-500">ehsansteam79@gmail.com</p>
        </Card>
        <Card variant="bordered" padding="md" className="text-center">
          <Phone className="w-8 h-8 text-primary-500 mx-auto mb-2" />
          <h3 className="font-semibold text-sm">
            {language === "fa" ? "تلفن" : "Phone"}
          </h3>
          <p className="text-xs text-neutral-500">+98 912 345 6789</p>
        </Card>
        <Card variant="bordered" padding="md" className="text-center">
          <MapPin className="w-8 h-8 text-primary-500 mx-auto mb-2" />
          <h3 className="font-semibold text-sm">
            {language === "fa" ? "آدرس" : "Address"}
          </h3>
          <p className="text-xs text-neutral-500">
            {language === "fa" ? "تهران، ایران" : "Tehran, Iran"}
          </p>
        </Card>
      </div>

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
    </motion.div>
  );
};

export default ContactPage;
