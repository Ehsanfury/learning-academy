/**
 * Card.jsx
 * Path: src/components/ui/Card.jsx
 * Description: Card component with multiple variants, padding options, and hover effects
 * Version: 3.0 - Improved with A11y, gradient, glass variants
 * Changes:
 * - ✅ Added gradient and glass variants
 * - ✅ Improved A11y (role for clickable cards)
 * - ✅ Better hover animation
 * - ✅ Added border variants
 * - ✅ Added CardHeader, CardBody, CardFooter as named exports
 */

import { forwardRef } from "react";
import { cn } from "@utils/helpers";

// ============================================
// 🎨 Variants
// ============================================

const variants = {
  default: "bg-white dark:bg-neutral-900 shadow-soft",
  bordered:
    "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800",
  elevated: "bg-white dark:bg-neutral-900 shadow-lg",
  ghost: "bg-transparent",
  gradient: "bg-gradient-to-br from-primary-500 to-accent-500 text-white",
  glass:
    "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border border-white/20 dark:border-white/10",
  "old-style":
    "bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700",
};

// ============================================
// 📏 Paddings
// ============================================

const paddings = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
  xl: "p-8",
};

// ============================================
// 📐 Rounded
// ============================================

const roundedClasses = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

// ============================================
// 🔄 Card Component
// ============================================

const Card = forwardRef(
  (
    {
      children,
      variant = "default",
      padding = "md",
      hover = false,
      className = "",
      onClick = null,
      rounded = "2xl",
      ...props
    },
    ref,
  ) => {
    const hoverClasses = hover
      ? "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      : "";

    const isClickable = Boolean(onClick);

    const Component = isClickable ? "button" : "div";

    return (
      <Component
        ref={ref}
        onClick={onClick}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={
          isClickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick?.(e);
                }
              }
            : undefined
        }
        className={cn(
          "w-full text-right transition-all duration-200",
          variants[variant] || variants.default,
          paddings[padding] || paddings.md,
          roundedClasses[rounded] || roundedClasses["2xl"],
          hoverClasses,
          className,
        )}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Card.displayName = "Card";

// ============================================
// ✅ CardHeader Component
// ============================================

export const CardHeader = ({ children, className = "", ...props }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between flex-wrap gap-2 mb-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================
// ✅ CardBody Component
// ============================================

export const CardBody = ({ children, className = "", ...props }) => {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
};

// ============================================
// ✅ CardFooter Component
// ============================================

export const CardFooter = ({ children, className = "", ...props }) => {
  return (
    <div
      className={cn(
        "mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================
// 📤 Default Export
// ============================================

export default Card;
