/**
 * CardBody.jsx
 * Path: src/components/ui/CardBody.jsx
 * Description: Card body component for main content
 */

import { cn } from "@utils/helpers";

/**
 * CardBody Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Body content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.spacing - 'none' | 'sm' | 'md' | 'lg'
 */
function CardBody({ children, className = "", spacing = "md", ...props }) {
  // ============================================
  // Spacing
  // ============================================
  const spacings = {
    none: "space-y-0",
    sm: "space-y-2",
    md: "space-y-4",
    lg: "space-y-6",
  };

  return (
    <div className={cn(spacings[spacing] || spacings.md, className)} {...props}>
      {children}
    </div>
  );
}

export default CardBody;
