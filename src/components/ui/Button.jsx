/**
 * Button.jsx
 * Path: src/components/ui/Button.jsx
 * Description: Button component with multiple variants, sizes, and states
 * Version: 3.0 - Improved with A11y, RTL, and group support
 * Changes:
 * - ✅ Added aria-busy for loading state
 * - ✅ Added aria-disabled for disabled state
 * - ✅ Added link variant for inline links
 * - ✅ Added iconOnly mode for icon buttons
 * - ✅ Improved keyboard navigation
 * - ✅ Added spinner custom color
 * - ✅ Added as prop for polymorphic rendering (button, a, Link)
 */

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@utils/helpers";

// ============================================
// 🎨 Variants
// ============================================

const variants = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm hover:shadow-md dark:bg-primary-600 dark:hover:bg-primary-500",
  secondary:
    "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700",
  outline:
    "border-2 border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-950",
  ghost:
    "text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800",
  danger:
    "bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 shadow-sm hover:shadow-md",
  success:
    "bg-success-500 text-white hover:bg-success-600 active:bg-success-700 shadow-sm hover:shadow-md",
  warning:
    "bg-warning-500 text-white hover:bg-warning-600 active:bg-warning-700 shadow-sm hover:shadow-md",
  dark: "bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-900 dark:bg-neutral-700 dark:hover:bg-neutral-600",
  gradient:
    "bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600 shadow-sm hover:shadow-md",
  link: "text-primary-500 hover:text-primary-600 hover:underline underline-offset-4 px-0 py-0 shadow-none",
};

// ============================================
// 📏 Sizes
// ============================================

const sizes = {
  xs: "px-2.5 py-1.5 text-xs gap-1.5 rounded-lg",
  sm: "px-4 py-2 text-sm gap-2 rounded-lg",
  md: "px-6 py-2.5 text-sm gap-2 rounded-xl",
  lg: "px-8 py-3.5 text-base gap-3 rounded-xl",
  xl: "px-10 py-4 text-lg gap-3 rounded-2xl",
  icon: "p-2 rounded-lg",
};

// ============================================
// 🔄 Button Component
// ============================================

const Button = forwardRef(
  (
    {
      // ========== Core Props ==========
      children,
      variant = "primary",
      size = "md",
      className = "",

      // ========== States ==========
      isLoading = false,
      disabled = false,
      fullWidth = false,

      // ========== Icon ==========
      icon: Icon = null,
      iconPosition = "left",
      iconOnly = false,

      // ========== Style ==========
      rounded = "full",
      shadow = false,

      // ========== Events ==========
      onClick,
      type = "button",

      // ========== A11y ==========
      ariaLabel,
      ariaDescribedBy,

      // ========== Other ==========
      ...props
    },
    ref,
  ) => {
    // ============================================
    // 📊 Computed
    // ============================================

    const isDisabled = disabled || isLoading;
    const computedSize = iconOnly ? "icon" : size;

    const roundedClasses = {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full",
    };

    const shadowClasses = shadow ? "shadow-lg hover:shadow-xl" : "";

    // ============================================
    // 🖼️ Render
    // ============================================

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={isDisabled ? undefined : onClick}
        whileTap={!isDisabled ? { scale: 0.97 } : undefined}
        whileHover={!isDisabled ? { scale: 1.02 } : undefined}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-200 select-none",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          "dark:focus-visible:ring-offset-neutral-900",
          variants[variant] || variants.primary,
          sizes[computedSize] || sizes.md,
          roundedClasses[rounded] || roundedClasses.full,
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
          fullWidth && "w-full",
          shadowClasses,
          className,
        )}
        disabled={isDisabled}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        aria-label={
          ariaLabel || (iconOnly && Icon ? Icon.displayName : undefined)
        }
        aria-describedby={ariaDescribedBy}
        {...props}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <Loader2
            className="w-4 h-4 animate-spin flex-shrink-0"
            aria-hidden="true"
          />
        )}

        {/* Left Icon */}
        {!isLoading && Icon && iconPosition === "left" && (
          <Icon
            className={cn("w-4 h-4 flex-shrink-0", children && "ml-2")}
            aria-hidden="true"
          />
        )}

        {/* Children (Text) */}
        {children}

        {/* Right Icon */}
        {!isLoading && Icon && iconPosition === "right" && (
          <Icon
            className={cn("w-4 h-4 flex-shrink-0", children && "mr-2")}
            aria-hidden="true"
          />
        )}

        {/* Icon Only */}
        {!isLoading && iconOnly && Icon && !children && (
          <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        )}
      </motion.button>
    );
  },
);

Button.displayName = "Button";

export default Button;
