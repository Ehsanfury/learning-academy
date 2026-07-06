/**
 * Input.jsx
 * Path: src/components/ui/Input.jsx
 * Description: Input component with label, error, icon, and password toggle
 * Version: 2.0 - Improved with more features
 */

import { forwardRef, useState } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@utils/helpers";

// ============================================
// 🎨 Variants
// ============================================

const variants = {
  default:
    "border-neutral-300 dark:border-neutral-700 focus:border-primary-500",
  error: "border-danger-400 focus:border-danger-500 text-danger-900",
  success: "border-success-400 focus:border-success-500 text-success-900",
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
// 🔤 Input Component
// ============================================

const Input = forwardRef(
  (
    {
      // ========== Core Props ==========
      label,
      error,
      hint,
      success = false,
      icon: Icon = null,
      type = "text",
      className = "",
      id,
      required = false,

      // ========== Size ==========
      size = "md",

      // ========== Password ==========
      showPasswordToggle = true,

      // ========== Other ==========
      ...props
    },
    ref,
  ) => {
    // ============================================
    // 📊 State
    // ============================================

    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label?.replace(/\s+/g, "-").toLowerCase();
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    // ============================================
    // 🎨 Status
    // ============================================

    const status = error ? "error" : success ? "success" : "default";

    // ============================================
    // 🖼️ Render
    // ============================================

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            {label}
            {required && <span className="text-danger-500 mr-1">*</span>}
          </label>
        )}

        {/* Input Wrapper */}
        <div className="relative">
          {/* Left Icon */}
          {Icon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Icon className="w-5 h-5 text-neutral-400" />
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              // Base styles
              "w-full bg-white dark:bg-neutral-900 transition-all duration-200",
              "focus:outline-none focus:ring-0",
              "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "disabled:opacity-50 disabled:cursor-not-allowed",

              // Size
              sizes[size] || sizes.md,

              // Status
              "border-2",
              variants[status],

              // Icon spacing
              Icon && "pr-10",
              isPassword && "pl-10",

              // Custom
              className,
            )}
            {...props}
          />

          {/* Password Toggle */}
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Status Icon */}
          {!isPassword && status === "error" && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <AlertCircle className="w-5 h-5 text-danger-500" />
            </div>
          )}

          {!isPassword && status === "success" && (
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

Input.displayName = "Input";

export default Input;
