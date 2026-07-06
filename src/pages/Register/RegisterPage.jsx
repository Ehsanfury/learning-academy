/**
 * RegisterPage.jsx
 * Path: src/pages/Register/RegisterPage.jsx
 * Description: Register page with form validation
 * Version: 3.1 - Fixed useAuthContext import
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguageContext } from "@context/LanguageContext";
import { useAuth } from "@context/AuthContext"; // ✅ اصلاح: useAuthContext -> useAuth
import { UserPlus, Mail, Lock, User, Globe, Target } from "lucide-react";
import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import toast from "react-hot-toast";

// ============================================
// 📝 Validation Schema
// ============================================

const registerSchema = z
  .object({
    name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
    email: z.string().email("لطفاً ایمیل معتبر وارد کنید"),
    password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
    confirmPassword: z
      .string()
      .min(6, "تکرار رمز عبور باید حداقل ۶ کاراکتر باشد"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن مطابقت ندارند",
    path: ["confirmPassword"],
  });

// ============================================
// 📊 RegisterPage Component
// ============================================

function RegisterPage() {
  const { language } = useLanguageContext();
  const { register: registerUser } = useAuth(); // ✅ اصلاح
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const { confirmPassword, ...userData } = data;

      const result = await registerUser(userData);

      if (result.success) {
        toast.success(
          language === "fa"
            ? "ثبت‌نام با موفقیت انجام شد! خوش آمدید 🎉"
            : "Registration successful! Welcome 🎉",
        );
        navigate("/dashboard");
      } else {
        toast.error(
          language === "fa"
            ? result.error || "خطا در ثبت‌نام"
            : result.error || "Registration failed",
        );
      }
    } catch (error) {
      console.error("Register error:", error);
      toast.error(language === "fa" ? "خطا در ثبت‌نام" : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-white">L</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {language === "fa" ? "شروع یادگیری!" : "Start Learning!"}
        </h1>
        <p className="text-neutral-500 mt-2">
          {language === "fa"
            ? "همین حالا ثبت‌نام کنید و آلمانی را هوشمندانه یاد بگیرید"
            : "Sign up now and learn German smartly"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={language === "fa" ? "نام کامل" : "Full Name"}
          type="text"
          placeholder={
            language === "fa" ? "نام خود را وارد کنید" : "Enter your name"
          }
          icon={User}
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label={language === "fa" ? "ایمیل" : "Email"}
          type="email"
          placeholder={
            language === "fa" ? "example@email.com" : "example@email.com"
          }
          icon={Mail}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label={language === "fa" ? "رمز عبور" : "Password"}
          type="password"
          placeholder={language === "fa" ? "••••••••" : "••••••••"}
          icon={Lock}
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          label={language === "fa" ? "تکرار رمز عبور" : "Confirm Password"}
          type="password"
          placeholder={language === "fa" ? "••••••••" : "••••••••"}
          icon={Lock}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          fullWidth
          isLoading={isLoading}
          icon={UserPlus}
        >
          {language === "fa"
            ? "ثبت‌نام و شروع یادگیری"
            : "Sign Up & Start Learning"}
        </Button>

        <p className="text-center text-sm text-neutral-500 mt-4">
          {language === "fa"
            ? "حساب کاربری دارید؟"
            : "Already have an account?"}{" "}
          <Link
            to="/login"
            className="text-primary-500 hover:text-primary-600 font-medium transition"
          >
            {language === "fa" ? "وارد شوید" : "Sign in"}
          </Link>
        </p>
      </form>
    </motion.div>
  );
}

export default RegisterPage;
