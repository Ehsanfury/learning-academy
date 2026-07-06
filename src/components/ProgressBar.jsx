import { motion } from "framer-motion";
import { cn } from "@utils/helpers";

function ProgressBar({
  value = 0,
  max = 100,
  size = "md",
  color = "primary",
  showLabel = false,
  labelPosition = "right",
  className = "",
  animated = true,
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
    xl: "h-6",
  };

  const colors = {
    primary: "bg-primary-500",
    success: "bg-success-500",
    warning: "bg-warning-500",
    danger: "bg-danger-500",
    accent: "bg-accent-500",
    gradient: "bg-gradient-to-r from-primary-500 to-accent-500",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showLabel && labelPosition === "left" && (
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 min-w-[40px] text-left">
          {Math.round(percentage)}%
        </span>
      )}

      <div
        className={cn(
          "flex-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden",
          sizes[size],
        )}
      >
        <motion.div
          className={cn("h-full rounded-full", colors[color])}
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {showLabel && labelPosition === "right" && (
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 min-w-[40px]">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

export default ProgressBar;
