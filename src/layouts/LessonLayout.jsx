import { Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { useLanguageContext } from "@context/LanguageContext";

function LessonLayout() {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguageContext();

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-neutral-950 overflow-hidden">
      {/* Minimal Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label={language === "fa" ? "بستن درس" : "Close lesson"}
        >
          <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </button>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-500 transition-colors"
        >
          {language === "fa" ? "خروج" : "Exit"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Lesson Content */}
      <div className="h-full overflow-y-auto">
        <motion.div
          className="min-h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}

export default LessonLayout;
