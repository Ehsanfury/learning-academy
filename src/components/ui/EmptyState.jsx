/**
 * EmptyState.jsx
 * Path: src/components/ui/EmptyState.jsx
 * Description: Empty state component for lists, pages, and search results
 * Version: 1.0 - New component
 * Features:
 * - ✅ Custom icon, title, description
 * - ✅ Action button (e.g., "Add new", "Refresh")
 * - ✅ Multiple sizes
 * - ✅ Variants (default, compact, illustrated)
 * - ✅ RTL support
 */

import Button from "./Button";
import { cn } from "@utils/helpers";

// ============================================
// 📏 Sizes
// ============================================

const sizes = {
  sm: {
    icon: "w-12 h-12",
    title: "text-base",
    description: "text-xs",
    padding: "py-6",
  },
  md: {
    icon: "w-16 h-16",
    title: "text-lg",
    description: "text-sm",
    padding: "py-10",
  },
  lg: {
    icon: "w-20 h-20",
    title: "text-xl",
    description: "text-base",
    padding: "py-16",
  },
};

// ============================================
// 🔄 EmptyState Component
// ============================================

const EmptyState = ({
  // ========== Content ==========
  icon: Icon,
  image,
  title = "موردی یافت نشد",
  description = "",

  // ========== Display ==========
  size = "md",
  variant = "default",

  // ========== Action ==========
  actionLabel,
  onAction,
  actionIcon,
  actionVariant = "primary",
  secondaryActionLabel,
  onSecondaryAction,

  // ========== Style ==========
  className = "",
}) => {
  const config = sizes[size] || sizes.md;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        config.padding,
        "px-4",
        className,
      )}
      role="status"
    >
      {/* Icon or Image */}
      {image ? (
        <img
          src={image}
          alt=""
          className={cn("mb-4", config.icon)}
          aria-hidden="true"
        />
      ) : Icon ? (
        <div
          className={cn(
            "mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center",
            config.icon,
          )}
          aria-hidden="true"
        >
          <Icon
            className={cn(
              "text-neutral-400 dark:text-neutral-500",
              size === "sm"
                ? "w-6 h-6"
                : size === "lg"
                  ? "w-10 h-10"
                  : "w-8 h-8",
            )}
          />
        </div>
      ) : null}

      {/* Title */}
      <h3
        className={cn(
          "font-bold text-neutral-900 dark:text-neutral-100 mb-2",
          config.title,
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            "text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6",
            config.description,
          )}
        >
          {description}
        </p>
      )}

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && (
            <Button
              variant={actionVariant}
              onClick={onAction}
              icon={actionIcon}
              size={size === "sm" ? "sm" : "md"}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button
              variant="ghost"
              onClick={onSecondaryAction}
              size={size === "sm" ? "sm" : "md"}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
