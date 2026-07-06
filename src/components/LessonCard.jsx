import { motion } from "framer-motion";
import { Lock, Play, Check, Star, Clock } from "lucide-react";
import { useLanguageContext } from "@context/LanguageContext";
import { cn } from "@utils/helpers";

function LessonCard({
  lesson,
  status = "locked", // 'locked' | 'available' | 'in-progress' | 'completed' | 'perfect'
  onStart = null,
  className = "",
}) {
  const { language } = useLanguageContext();

  const statusConfig = {
    locked: {
      icon: Lock,
      bgClass: "bg-neutral-100 dark:bg-neutral-800",
      iconClass: "text-neutral-400",
      actionLabel: { fa: "قفل", en: "Locked" },
      clickable: false,
    },
    available: {
      icon: Play,
      bgClass:
        "bg-primary-50 dark:bg-primary-950 hover:bg-primary-100 dark:hover:bg-primary-900",
      iconClass: "text-primary-500",
      actionLabel: { fa: "شروع", en: "Start" },
      clickable: true,
    },
    "in-progress": {
      icon: Play,
      bgClass:
        "bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900",
      iconClass: "text-amber-500",
      actionLabel: { fa: "ادامه", en: "Continue" },
      clickable: true,
    },
    completed: {
      icon: Check,
      bgClass: "bg-success-50 dark:bg-success-950",
      iconClass: "text-success-500",
      actionLabel: { fa: "تکمیل شده", en: "Completed" },
      clickable: true,
    },
    perfect: {
      icon: Star,
      bgClass: "bg-amber-50 dark:bg-amber-950",
      iconClass: "text-amber-500",
      actionLabel: { fa: "عالی", en: "Perfect" },
      clickable: true,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={config.clickable ? { scale: 1.02, y: -2 } : undefined}
      whileTap={config.clickable ? { scale: 0.98 } : undefined}
      onClick={config.clickable ? onStart : undefined}
      className={cn(
        "relative rounded-2xl p-4 transition-all duration-200 shadow-soft",
        config.bgClass,
        config.clickable ? "cursor-pointer" : "cursor-not-allowed",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            status === "locked"
              ? "bg-neutral-200 dark:bg-neutral-700"
              : "bg-white dark:bg-neutral-800",
          )}
        >
          <Icon className={cn("w-5 h-5", config.iconClass)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
            {lesson?.title?.[language] || `درس ${lesson?.lessonNumber || ""}`}
          </h3>

          <div className="flex items-center gap-3 text-xs text-neutral-500">
            {lesson?.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lesson.duration} {language === "fa" ? "دقیقه" : "min"}
              </span>
            )}
            {lesson?.xpReward && (
              <span className="font-medium text-primary-500">
                +{lesson.xpReward} XP
              </span>
            )}
          </div>
        </div>

        {/* Right decoration */}
        {status === "completed" && (
          <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
        {status === "perfect" && (
          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Star className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Progress bar for in-progress */}
      {status === "in-progress" && (
        <div className="mt-3 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full w-1/2" />
        </div>
      )}
    </motion.div>
  );
}

export default LessonCard;
