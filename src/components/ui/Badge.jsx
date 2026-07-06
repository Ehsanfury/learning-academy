/**
 * Badge.jsx
 * Path: src/components/ui/Badge.jsx
 * Description: Badge component with multiple variants, sizes, and dot indicator
 * Version: 2.0 - Improved with more variants and features
 */

import { cn } from "@utils/helpers";

// ============================================
// 🎨 Variants
// ============================================

const variants = {
  primary:
    "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300",
  secondary:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  success:
    "bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300",
  warning:
    "bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300",
  danger:
    "bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-300",
  accent:
    "bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  dark: "bg-neutral-800 text-white dark:bg-neutral-700 dark:text-white",
  outline:
    "border-2 border-primary-500 text-primary-500 dark:border-primary-400 dark:text-primary-400 bg-transparent",
};

// ============================================
// 📏 Sizes
// ============================================

const sizes = {
  xs: "px-1.5 py-0.5 text-2xs",
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-sm",
  xl: "px-4 py-2 text-base",
};

// ============================================
// 🔤 Badge Component
// ============================================

function Badge({
  children,
  variant = "primary",
  size = "sm",
  className = "",

  // ========== Dot ==========
  dot = false,
  dotColor = null,
  dotPulse = false,

  // ========== Pill ==========
  pill = true,

  // ========== Dismissible ==========
  dismissible = false,
  onDismiss = null,

  // ========== Counter ==========
  count = null,
  maxCount = 99,

  ...props
}) {
  // ============================================
  // 📊 Computed
  // ============================================

  const displayCount =
    count !== null ? (count > maxCount ? `${maxCount}+` : count) : null;

  const pillClass = pill ? "rounded-full" : "rounded-md";

  const dotPulseClass = dotPulse ? "animate-pulse" : "";

  // ============================================
  // 🖼️ Render
  // ============================================

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium whitespace-nowrap",
        variants[variant],
        sizes[size],
        pillClass,
        className,
      )}
      {...props}
    >
      {/* Dot */}
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            dotColor || "bg-current",
            dotPulseClass,
          )}
        />
      )}

      {/* Content */}
      {children}

      {/* Count */}
      {displayCount !== null && (
        <span
          className={cn(
            "ml-1 px-1.5 py-0.5 rounded-full text-xs bg-black/10 dark:bg-white/10",
            variant === "outline" && "bg-primary-100 dark:bg-primary-900",
          )}
        >
          {displayCount}
        </span>
      )}

      {/* Dismiss Button */}
      {dismissible && (
        <button
          onClick={onDismiss}
          className={cn(
            "ml-1 -mr-1 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary-500",
          )}
          aria-label="Remove"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

export default Badge;
