import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import { Home, ArrowRight } from "lucide-react";
import Button from "@components/ui/Button";

function NotFoundPage() {
  const { language } = useLanguageContext();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-6">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-8xl font-extrabold gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          {language === "fa" ? "صفحه پیدا نشد" : "Page Not Found"}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8">
          {language === "fa"
            ? "متأسفانه صفحه‌ای که دنبالش هستی وجود نداره یا حذف شده."
            : "Sorry, the page you're looking for doesn't exist or has been moved."}
        </p>
        <Link to="/">
          <Button variant="primary" size="lg" icon={Home}>
            {language === "fa" ? "بازگشت به خانه" : "Back to Home"}
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

export default NotFoundPage;
