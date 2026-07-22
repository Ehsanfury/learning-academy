/**
 * ScreenReader.jsx
 * Path: src/components/a11y/ScreenReader.jsx
 * Description: Screen reader only components and helpers
 * Version: 1.0 - New component
 * Features:
 * - ✅ SROnly - visually hidden but readable by screen readers
 * - ✅ VisuallyHidden - alias for SROnly
 * - ✅ LiveRegion - for dynamic announcements
 * - ✅ SkipLink - skip to main content
 */

import { forwardRef } from "react";
import { cn } from "@utils/helpers";

// ============================================
// 🎯 SROnly - Screen reader only
// ============================================

export const SROnly = forwardRef(
  ({ children, className = "", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "sr-only",
        "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  ),
);

SROnly.displayName = "SROnly";

// ============================================
// 🎯 VisuallyHidden - Alias for SROnly
// ============================================

export const VisuallyHidden = SROnly;

// ============================================
// 📢 LiveRegion - For dynamic announcements
// ============================================

export const LiveRegion = ({
  children,
  politeness = "polite", // 'polite' | 'assertive' | 'off'
  atomic = true,
  relevant = "additions text",
  className = "",
  ...props
}) => (
  <span
    aria-live={politeness}
    aria-atomic={atomic}
    aria-relevant={relevant}
    className={cn("sr-only", className)}
    {...props}
  >
    {children}
  </span>
);

// ============================================
// ⏭️ SkipLink - Skip to main content
// ============================================

export const SkipLink = ({
  children = "پرش به محتوای اصلی",
  targetId = "main-content",
  className = "",
}) => {
  const handleClick = (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        "sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-[200]",
        "focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg focus:shadow-lg",
        className,
      )}
    >
      {children}
    </a>
  );
};

// ============================================
// 📋 Default export
// ============================================

export default {
  SROnly,
  VisuallyHidden,
  LiveRegion,
  SkipLink,
};
