/**
 * CardFooter.jsx
 * Path: src/components/ui/CardFooter.jsx
 * Description: Card footer component for actions and additional info
 */

import { cn } from "@utils/helpers";

/**
 * CardFooter Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Footer content (usually buttons)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.noBorder - Remove top border
 * @param {string} props.spacing - 'none' | 'sm' | 'md' | 'lg'
 */
function CardFooter({
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
    none: "mt-0 pt-0",
    sm: "mt-2 pt-2",
    md: "mt-4 pt-4",
    lg: "mt-6 pt-6",
  };

  // ============================================
  // Border
  // ============================================
  const borderClass = noBorder
    ? ""
    : "border-t border-neutral-200 dark:border-neutral-800";

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

export default CardFooter;
