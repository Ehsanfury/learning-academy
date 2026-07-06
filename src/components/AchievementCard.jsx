import { motion } from "framer-motion";
import { Lock, Check, Star, Award } from "lucide-react";
import { useLanguageContext } from "@context/LanguageContext";
import { cn } from "@utils/helpers";

function AchievementCard({
  achievement,
  unlocked = false,
  progress = 0,
  onClick = null,
  className = "",
}) {
  const { language } = useLanguageContext();

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        "relative bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-soft cursor-pointer select-none",
        !unlocked && "opacity-70",
        className,
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center mb-3",
          unlocked
            ? "bg-gradient-to-br from-amber-400 to-amber-600"
            : "bg-neutral-200 dark:bg-neutral-800",
        )}
      >
        {unlocked ? (
          <Award className="w-7 h-7 text-white" />
        ) : (
          <Lock className="w-6 h-6 text-neutral-400 dark:text-neutral-600" />
        )}
      </div>

      {/* Info */}
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
        {achievement?.name?.[language] || "دستاورد"}
      </h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
        {achievement?.description?.[language] || ""}
      </p>

      {/* Progress */}
      {!unlocked && progress > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xs text-neutral-400">
              {language === "fa" ? "پیشرفت" : "Progress"}
            </span>
            <span className="text-2xs text-neutral-500">{progress}%</span>
          </div>
          <div className="h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Unlocked Badge */}
      {unlocked && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      )}
    </motion.div>
  );
}

export default AchievementCard;
