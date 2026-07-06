/**
 * LoadingSpinner.jsx
 * Path: src/components/LoadingSpinner.jsx
 * Description: Loading spinner component with multiple sizes
 * Version: 2.0 - Updated with new UI components
 */

import React from "react";
import { cn } from "@utils/helpers";
import { Loader2 } from "lucide-react";

// ============================================
// 📏 Sizes
// ============================================

const sizes = {
  xs: "w-4 h-4",
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

// ============================================
// 🎨 Colors
// ============================================

const colors = {
  primary: "text-primary-500",
  secondary: "text-neutral-500",
  success: "text-success-500",
  danger: "text-danger-500",
  warning: "text-warning-500",
  white: "text-white",
};

// ============================================
// 🔤 LoadingSpinner Component
// ============================================

function LoadingSpinner({
  size = "md",
  color = "primary",
  className = "",
  label = null,
  fullScreen = false,
  ...props
}) {
  // ============================================
  // 🖼️ Render
  // ============================================

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2
        className={cn(
          "animate-spin",
          sizes[size] || sizes.md,
          colors[color] || colors.primary,
          className,
        )}
        {...props}
      />
      {label && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {label}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export default LoadingSpinner;
