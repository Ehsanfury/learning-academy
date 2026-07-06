import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { useLanguageContext } from "@context/LanguageContext";
import { formatNumber } from "@utils/helpers";

function XPCard({
  xp = 0,
  level = 1,
  nextLevelXP = 500,
  showAnimation = false,
}) {
  const { language } = useLanguageContext();
  const progress = Math.min((xp / nextLevelXP) * 100, 100);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-soft relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 to-accent-400" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {language === "fa" ? "امتیاز کل" : "Total XP"}
            </p>
            <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {formatNumber(xp, language)}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {language === "fa" ? "سطح" : "Level"}
          </p>
          <p className="text-xl font-bold text-primary-500">{level}</p>
        </div>
      </div>

      {/* Progress to Next Level */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {language === "fa" ? "تا سطح بعدی" : "To next level"}
          </span>
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
            {formatNumber(nextLevelXP - xp, language)} XP
          </span>
        </div>

        <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-400 to-accent-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* XP Gain Animation */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            className="absolute top-2 right-2"
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -10, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-bold text-success-500">
              +{language === "fa" ? "۵۰" : "50"} XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default XPCard;
