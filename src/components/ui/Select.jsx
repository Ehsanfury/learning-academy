/**
 * Select.jsx
 * Path: src/components/ui/Select.jsx
 * Description: Select component with label, error, and icon
 * Version: 2.0 - Improved with more features
 */

import { forwardRef } from "react";
import { ChevronDown, AlertCircle, CheckCircle } from "lucide-react";
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
// 🔤 Select Component
// ============================================

const Select = forwardRef(
  (
    {
      // ========== Core Props ==========
      label,
      error,
      hint,
      success = false,
      options = [],
      placeholder,
      className = "",
      id,
      required = false,
      icon: Icon = null,

      // ========== Size ==========
      size = "md",

      // ========== Value ==========
      value = "",

      // ========== Other ==========
      ...props
    },
    ref,
  ) => {
    // ============================================
    // 📊 Computed
    // ============================================

    const selectId = id || label?.replace(/\s+/g, "-").toLowerCase();
    const status = error ? "error" : success ? "success" : "default";
    const hasValue = value !== "" && value !== null && value !== undefined;

    // ============================================
    // 🖼️ Render
    // ============================================

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            {label}
            {required && <span className="text-danger-500 mr-1">*</span>}
          </label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {Icon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Icon className="w-5 h-5 text-neutral-400" />
            </div>
          )}

          {/* Select */}
          <select
            ref={ref}
            id={selectId}
            value={value}
            className={cn(
              // Base styles
              "w-full bg-white dark:bg-neutral-900 transition-all duration-200 appearance-none cursor-pointer",
              "focus:outline-none focus:ring-0",
              "disabled:opacity-50 disabled:cursor-not-allowed",

              // Size
              sizes[size] || sizes.md,

              // Status
              "border-2",
              variants[status],

              // Text color
              hasValue
                ? "text-neutral-900 dark:text-neutral-100"
                : "text-neutral-400 dark:text-neutral-500",

              // Icon spacing
              Icon && "pr-10",

              // Custom
              className,
            )}
            {...props}
          >
            {/* Placeholder */}
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {/* Options */}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="text-neutral-900 dark:text-neutral-100"
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Down Arrow */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <ChevronDown className="w-5 h-5 text-neutral-400" />
          </div>

          {/* Status Icon */}
          {status === "error" && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <AlertCircle className="w-5 h-5 text-danger-500" />
            </div>
          )}

          {status === "success" && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
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
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
