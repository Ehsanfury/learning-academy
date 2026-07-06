/**
 * CardHeader.jsx
 * Path: src/components/ui/CardHeader.jsx
 * Description: Card header component for consistent card titles and actions
 */

import { cn } from "@utils/helpers";

/**
 * CardHeader Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Header content (usually title + actions)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.noBorder - Remove bottom border
 * @param {string} props.spacing - 'none' | 'sm' | 'md' | 'lg'
 */
function CardHeader({
  children,
  className = "",
  noBorder = false,
  spacing = "md",
  ...props
}) {
  // ============================================
  // Spacing
  // ============================================
  const spacings = {
    none: "mb-0",
    sm: "mb-2",
    md: "mb-4",
    lg: "mb-6",
  };

  // ============================================
  // Border
  // ============================================
  const borderClass = noBorder
    ? ""
    : "border-b border-neutral-200 dark:border-neutral-800 pb-4";

  return (
    <div
      className={cn(
        "flex items-center justify-between flex-wrap gap-2",
        spacings[spacing] || spacings.md,
        borderClass,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default CardHeader;
