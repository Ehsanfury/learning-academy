/**
 * Card.jsx
 * Path: src/components/ui/Card.jsx
 * Description: Card component with multiple variants, padding options, and hover effects
 * Version: 2.1 - Fixed padding for better spacing
 */

import { cn } from "@utils/helpers";

/**
 * Card Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.variant - 'default' | 'bordered' | 'elevated' | 'ghost'
 * @param {string} props.padding - 'none' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} props.hover - Enable hover effects
 * @param {string} props.className - Additional CSS classes
 * @param {function} props.onClick - Click handler
 * @param {string} props.rounded - 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
 */
function Card({
  children,
  variant = "default",
  padding = "md",
  hover = false,
  className = "",
  onClick = null,
  rounded = "2xl",
  ...props
}) {
  // ============================================
  // Variants
  // ============================================
  const variants = {
    default: "bg-white dark:bg-neutral-900 shadow-soft",
    bordered:
      "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800",
    elevated: "bg-white dark:bg-neutral-900 shadow-md",
    ghost: "bg-transparent",
    "old-style":
      "bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700",
  };

  // ============================================
  // Paddings
  // ============================================
  const paddings = {
    none: "p-0",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
    xl: "p-8",
  };

  // ============================================
  // Rounded
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
  // Hover Effects
  // ============================================
  const hoverClasses = hover
    ? "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    : "";

  // ============================================
  // Click handler (if provided)
  // ============================================
  const Component = onClick ? "button" : "div";

  // ============================================
  // Render
  // ============================================
  return (
    <Component
      onClick={onClick}
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
}

export default Card;
