import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import { ArrowRight } from "lucide-react";

function AuthLayout() {
  const { language, isRTL } = useLanguageContext();

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950">
      {/* Left Side - Illustration (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 to-primary-700 items-center justify-center p-12">
        <div className="max-w-md text-white text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl font-bold">G</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">
              {language === "fa"
                ? "به آکادمی آلمانی خوش آمدید"
                : "Welcome to German Academy"}
            </h1>
            <p className="text-lg text-white/80">
              {language === "fa"
                ? "یادگیری آلمانی را با روشی هوشمند و جذاب شروع کنید"
                : "Start learning German with a smart and engaging method"}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Back to Home */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-500 mb-8 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            {language === "fa" ? "بازگشت به خانه" : "Back to Home"}
          </Link>

          {/* Form Content */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-soft p-8">
            <Outlet />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AuthLayout;
