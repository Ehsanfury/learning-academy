/**
 * Textarea.jsx
 * Path: src/components/ui/Textarea.jsx
 * Description: Textarea component with label, error, and character count
 * Version: 2.0 - Improved with more features
 */

import { forwardRef } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@utils/helpers";

// ============================================
// 🎨 Variants
// ============================================

const variants = {
  default:
    "border-neutral-300 dark:border-neutral-700 focus:border-primary-500",
  error: "border-danger-400 focus:border-danger-500",
  success: "border-success-400 focus:border-success-500",
};

// ============================================
// 📏 Sizes
// ============================================

const sizes = {
  sm: "px-3 py-2 text-sm rounded-lg",
  md: "px-4 py-2.5 text-base rounded-xl",
  lg: "px-5 py-3 text-lg rounded-xl",
};

// ============================================
// 🔤 Textarea Component
// ============================================

const Textarea = forwardRef(
  (
    {
      // ========== Core Props ==========
      label,
      error,
      hint,
      success = false,
      className = "",
      id,
      required = false,

      // ========== Size ==========
      size = "md",

      // ========== Character Count ==========
      maxLength = null,
      showCount = false,
      value = "",

      // ========== Rows ==========
      rows = 4,

      // ========== Auto Resize ==========
      autoResize = false,

      // ========== Other ==========
      ...props
    },
    ref,
  ) => {
    // ============================================
    // 📊 Computed
    // ============================================

    const textareaId = id || label?.replace(/\s+/g, "-").toLowerCase();
    const charCount = value?.length || 0;
    const status = error ? "error" : success ? "success" : "default";
    const isOverLimit = maxLength && charCount > maxLength;

    // ============================================
    // 🖼️ Render
    // ============================================

    return (
      <div className="w-full">
        {/* Label + Character Count */}
        {label && (
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor={textareaId}
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              {label}
              {required && <span className="text-danger-500 mr-1">*</span>}
            </label>

            {/* Character Count in Label */}
            {showCount && maxLength && (
              <span
                className={cn(
                  "text-xs",
                  isOverLimit
                    ? "text-danger-500"
                    : charCount > maxLength * 0.8
                      ? "text-warning-500"
                      : "text-neutral-400",
                )}
              >
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}

        {/* Textarea */}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            rows={rows}
            maxLength={maxLength}
            value={value}
            className={cn(
              // Base styles
              "w-full bg-white dark:bg-neutral-900 transition-all duration-200 resize-vertical",
              "focus:outline-none focus:ring-0",
              "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "disabled:opacity-50 disabled:cursor-not-allowed",

              // Size
              sizes[size] || sizes.md,

              // Status
              "border-2",
              variants[status],

              // Custom
              className,

              // Auto Resize
              autoResize && "resize-none overflow-hidden",
            )}
            style={autoResize ? { height: "auto", minHeight: "60px" } : {}}
            onInput={(e) => {
              if (autoResize) {
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }
            }}
            {...props}
          />

          {/* Status Icon */}
          {status === "error" && (
            <div className="absolute top-3 right-3 pointer-events-none">
              <AlertCircle className="w-5 h-5 text-danger-500" />
            </div>
          )}

          {status === "success" && (
            <div className="absolute top-3 right-3 pointer-events-none">
              <CheckCircle className="w-5 h-5 text-success-500" />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1.5 text-xs text-danger-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}

        {/* Hint */}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-neutral-400">{hint}</p>
        )}

        {/* Character Count (if not in label) */}
        {showCount && maxLength && !label && (
          <div className="flex justify-end mt-1">
            <span
              className={cn(
                "text-xs",
                isOverLimit
                  ? "text-danger-500"
                  : charCount > maxLength * 0.8
                    ? "text-warning-500"
                    : "text-neutral-400",
              )}
            >
              {charCount}/{maxLength}
            </span>
          </div>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
