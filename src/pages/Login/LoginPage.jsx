/**
 * LoginPage.jsx
 * Path: src/pages/Login/LoginPage.jsx
 * Description: Login page
 * Changes:
 * - ✅ FIXED: useAuthContext → useAuth (correct hook name)
 * - ✅ Removed 5 second debug delay
 * - ✅ Cleaned up logging
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguageContext } from "@context/LanguageContext";
import { useAuth } from "@context/AuthContext";
import { LogIn, Mail, Lock } from "lucide-react";
import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import toast from "react-hot-toast";
import debug from "../../utils/debug";

// ============================================
// 📝 Validation Schema
// ============================================

const loginSchema = z.object({
  email: z.string().email("Invalid email").min(1, "Email is required"),
  password: z.string().min(6, "Password must contain at least 6 characters"),
});

// ============================================
// 📊 LoginPage Component
// ============================================

const LoginPage = () => {
  const { language } = useLanguageContext();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      debug.info("🔄 Login attempt:", { email: data.email });

      const result = await login(data.email, data.password);

      if (result.success) {
        toast.success(
          language === "fa" ? "✅ ورود موفق!" : "✅ Login successful!",
        );
        navigate("/dashboard");
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch (error) {
      debug.error("Login error:", error);
      toast.error(error.message || "Login failed");
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
          {language === "fa" ? "ورود به حساب" : "Login to your account"}
        </h1>
        <p className="text-neutral-500 mt-2">
          {language === "fa"
            ? "خوش آمدید! لطفاً اطلاعات خود را وارد کنید"
            : "Welcome back! Please enter your details"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={language === "fa" ? "ایمیل" : "Email"}
          type="email"
          placeholder="admin@german-academy.com"
          icon={Mail}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label={language === "fa" ? "رمز عبور" : "Password"}
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-sm text-primary-500 hover:text-primary-600 transition"
          >
            {language === "fa"
              ? "رمز عبور را فراموش کردید؟"
              : "Forgot password?"}
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          icon={LogIn}
        >
          {language === "fa" ? "ورود" : "Login"}
        </Button>

        <p className="text-center text-sm text-neutral-500">
          {language === "fa" ? "حساب کاربری ندارید؟" : "Don't have an account?"}{" "}
          <Link
            to="/register"
            className="text-primary-500 hover:text-primary-600 font-medium transition"
          >
            {language === "fa" ? "ثبت‌نام کنید" : "Sign up"}
          </Link>
        </p>
      </form>
    </motion.div>
  );
};

export default LoginPage;
