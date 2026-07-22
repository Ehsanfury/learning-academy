/**
 * Skeleton.jsx
 * Path: src/components/ui/Skeleton.jsx
 * Description: Skeleton loading component with multiple variants
 * Version: 3.0 - Improved with more variants and better shimmer
 * Changes:
 * - ✅ Added more variants (table, list, profile)
 * - ✅ Better shimmer animation
 * - ✅ ARIA labels for screen readers
 * - ✅ Reduced motion support
 * - ✅ Custom width/height via style
 */

import { cn } from "@utils/helpers";

// ============================================
// 🎨 Variants
// ============================================

const variants = {
  // Text
  text: "h-4 w-full rounded",
  title: "h-6 w-3/4 rounded-lg",
  subtitle: "h-5 w-1/2 rounded-lg",
  caption: "h-3 w-1/3 rounded",

  // Avatar
  avatar: "h-12 w-12 rounded-full",
  avatarSm: "h-8 w-8 rounded-full",
  avatarLg: "h-16 w-16 rounded-full",

  // Image
  thumbnail: "h-24 w-full rounded-lg",
  image: "h-48 w-full rounded-xl",
  imageLg: "h-64 w-full rounded-2xl",

  // Card
  card: "h-48 w-full rounded-2xl",
  cardSm: "h-32 w-full rounded-xl",
  cardLg: "h-64 w-full rounded-2xl",

  // Button
  button: "h-10 w-24 rounded-full",
  buttonSm: "h-8 w-20 rounded-full",
  buttonLg: "h-12 w-32 rounded-full",

  // Table
  tableRow: "h-12 w-full rounded-lg",
  tableHeader: "h-8 w-full rounded",

  // List
  listItem: "h-16 w-full rounded-xl",

  // Profile
  profileHeader: "h-32 w-full rounded-2xl",

  // Other
  circle: "h-16 w-16 rounded-full",
  circleSm: "h-10 w-10 rounded-full",
  circleLg: "h-24 w-24 rounded-full",
  rectangle: "h-20 w-full rounded-xl",
  bar: "h-2 w-full rounded-full",
};

// ============================================
// 🔄 Animation Variants
// ============================================

const animationVariants = {
  pulse: "animate-pulse",
  shimmer: "animate-shimmer",
  none: "",
};

// ============================================
// 🔤 Skeleton Component
// ============================================

function Skeleton({
  className = "",
  variant = "text",

  // ========== Size ==========
  width = null,
  height = null,

  // ========== Count ==========
  count = 1,

  // ========== Animation ==========
  animation = "pulse",

  // ========== Shape ==========
  rounded = null,

  // ========== Color ==========
  color = "neutral",

  // ========== Layout ==========
  direction = "vertical",
  gap = "sm",

  // ========== A11y ==========
  ariaLabel = "در حال بارگذاری...",

  ...props
}) {
  // ============================================
  // 📊 Computed
  // ============================================

  const colorClasses = {
    neutral: "bg-neutral-200 dark:bg-neutral-800",
    primary: "bg-primary-200 dark:bg-primary-800",
    success: "bg-success-200 dark:bg-success-800",
    warning: "bg-warning-200 dark:bg-warning-800",
    danger: "bg-danger-200 dark:bg-danger-800",
    accent: "bg-accent-200 dark:bg-accent-800",
  };

  const roundedMap = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  };

  const gapClasses = {
    none: "gap-0",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  const directionClasses = {
    vertical: "flex flex-col",
    horizontal: "flex flex-row",
  };

  const variantClass = variants[variant] || variants.text;
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;
  const roundedClass = rounded ? roundedMap[rounded] : "";
  const colorClass = colorClasses[color] || colorClasses.neutral;
  const animationClass =
    animationVariants[animation] || animationVariants.pulse;

  // ============================================
  // 🖼️ Render Items
  // ============================================

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      role="status"
      aria-label={ariaLabel}
      className={cn(
        "relative overflow-hidden motion-reduce:animate-none",
        variantClass,
        colorClass,
        animationClass,
        roundedClass,
        className,
      )}
      style={style}
      {...props}
    >
      {/* Shimmer Effect */}
      {animation === "shimmer" && (
        <div className="absolute inset-0 -translate-x-full animate-shimmer motion-reduce:animate-none">
          <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      )}

      {/* Screen reader only */}
      <span className="sr-only">{ariaLabel}</span>
    </div>
  ));

  // ============================================
  // 🖼️ Render
  // ============================================

  if (count === 1) {
    return items[0];
  }

  return (
    <div
      className={cn(
        directionClasses[direction] || directionClasses.vertical,
        gapClasses[gap] || gapClasses.sm,
      )}
    >
      {items}
    </div>
  );
}

export default Skeleton;
