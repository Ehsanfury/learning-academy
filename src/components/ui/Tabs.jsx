/**
 * Tabs.jsx
 * Path: src/components/ui/Tabs.jsx
 * Description: Tabs component with multiple variants
 * Version: 2.0 - Improved with more features
 */

import { motion } from "framer-motion";
import { cn } from "@utils/helpers";

// ============================================
// 🎨 Variants
// ============================================

const variants = {
  // زیرخط
  underline: {
    container: "flex border-b border-neutral-200 dark:border-neutral-800 gap-0",
    tab: (isActive) =>
      cn(
        "relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
        isActive
          ? "text-primary-600 dark:text-primary-400"
          : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
      ),
    indicator: "absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500",
  },

  // دکمه‌های گرد
  pills: {
    container: "flex gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-full",
    tab: (isActive) =>
      cn(
        "relative px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap",
        isActive
          ? "text-neutral-900 dark:text-neutral-100"
          : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
      ),
    indicator:
      "absolute inset-0 bg-white dark:bg-neutral-700 rounded-full shadow-sm",
  },

  // کارت‌ها
  cards: {
    container: "flex gap-2",
    tab: (isActive) =>
      cn(
        "px-4 py-2.5 text-sm font-medium rounded-xl border-2 transition-all whitespace-nowrap",
        isActive
          ? "border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 shadow-sm"
          : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800",
      ),
    indicator: null,
  },

  // خطی
  line: {
    container: "flex gap-1",
    tab: (isActive) =>
      cn(
        "relative px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
        isActive
          ? "text-primary-600 dark:text-primary-400"
          : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
      ),
    indicator: "absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500",
  },

  // با آیکون
  icon: {
    container: "flex gap-3",
    tab: (isActive) =>
      cn(
        "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border-2 transition-all whitespace-nowrap",
        isActive
          ? "border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400"
          : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800",
      ),
    indicator: null,
  },
};

// ============================================
// 🔤 Tabs Component
// ============================================

function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = "underline",
  className = "",

  // ========== Size ==========
  size = "md",

  // ========== Full Width ==========
  fullWidth = false,

  // ========== Scrollable ==========
  scrollable = false,

  ...props
}) {
  // ============================================
  // 📏 Sizes
  // ============================================

  const sizeClasses = {
    sm: "text-xs px-3 py-2",
    md: "text-sm px-4 py-2.5",
    lg: "text-base px-6 py-3",
  };

  // ============================================
  // 📊 Config
  // ============================================

  const config = variants[variant] || variants.underline;

  // ============================================
  // 🖼️ Render
  // ============================================

  return (
    <div
      className={cn(
        config.container,
        fullWidth && "w-full",
        scrollable && "overflow-x-auto flex-nowrap",
        className,
      )}
      {...props}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const TabIcon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              config.tab(isActive),
              sizeClasses[size] || sizeClasses.md,
              fullWidth && "flex-1 justify-center",
              "relative",
            )}
            disabled={tab.disabled}
          >
            {/* Indicator (برای variants که indicator دارند) */}
            {variant === "pills" && isActive && config.indicator && (
              <motion.div
                layoutId="tabIndicator"
                className={config.indicator}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}

            {variant === "underline" && isActive && config.indicator && (
              <motion.div
                layoutId="tabIndicator"
                className={config.indicator}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}

            {variant === "line" && isActive && config.indicator && (
              <motion.div
                layoutId="tabIndicator"
                className={config.indicator}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}

            {/* Icon */}
            {TabIcon && (
              <span
                className={cn(
                  "flex-shrink-0",
                  isActive ? "text-primary-500" : "text-neutral-400",
                  tab.label && "ml-2",
                )}
              >
                <TabIcon
                  className={cn(
                    "w-4 h-4",
                    size === "lg" && "w-5 h-5",
                    size === "sm" && "w-3 h-3",
                  )}
                />
              </span>
            )}

            {/* Label */}
            <span className="relative z-10">{tab.label}</span>

            {/* Count Badge */}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  "ml-2 text-xs px-1.5 py-0.5 rounded-full",
                  isActive
                    ? "bg-primary-100 text-primary-600 dark:bg-primary-800 dark:text-primary-300"
                    : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400",
                )}
              >
                {tab.count}
              </span>
            )}

            {/* Disabled overlay */}
            {tab.disabled && (
              <span className="absolute inset-0 bg-white/50 dark:bg-neutral-900/50 rounded-lg cursor-not-allowed" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
