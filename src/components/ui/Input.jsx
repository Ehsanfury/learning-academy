/**
 * Input.jsx
 * Path: src/components/ui/Input.jsx
 * Description: Input component with label, error, icon, and password toggle
 * Version: 3.0 - Improved with A11y, textarea support, and clear button
 * Changes:
 * - ✅ Added aria-invalid and aria-describedby for screen readers
 * - ✅ Added clear button (X)
 * - ✅ Better RTL support
 * - ✅ Added character count for maxLength
 * - ✅ Added multiline/textarea support
 * - ✅ Added prefix/suffix slots
 */

import { forwardRef, useState, useId } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle, X } from "lucide-react";
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

      // ========== Clear Button ==========
      clearable = false,
      onClear,

      // ========== Character Count ==========
      showCount = false,
      maxLength,

      // ========== Prefix/Suffix ==========
      prefix,
      suffix,

      // ========== Multiline ==========
      multiline = false,
      rows = 4,

      // ========== Value ==========
      value,
      defaultValue,

      // ========== Other ==========
      ...props
    },
    ref,
  ) => {
    // ============================================
    // 📊 State
    // ============================================

    const [showPassword, setShowPassword] = useState(false);
    const reactId = useId();
    const inputId = id || reactId;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;

    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    // ============================================
    // 🎨 Status
    // ============================================

    const status = error ? "error" : success ? "success" : "default";

    // ============================================
    // 📊 Character Count
    // ============================================

    const currentValue = value ?? defaultValue ?? "";
    const charCount = String(currentValue).length;

    // ============================================
    // 🖼️ Render
    // ============================================

    const inputClasses = cn(
      "w-full bg-white dark:bg-neutral-900 transition-all duration-200",
      "focus:outline-none focus:ring-0",
      "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      sizes[size] || sizes.md,
      "border-2",
      variants[status],
      Icon && "pr-10",
      isPassword && "pl-10",
      clearable && "pl-10",
      prefix && "pr-12",
      suffix && "pl-12",
      className,
    );

    const inputProps = {
      ref,
      id: inputId,
      type: multiline ? undefined : inputType,
      className: inputClasses,
      "aria-invalid": status === "error",
      "aria-describedby": cn(error && errorId, hint && hintId) || undefined,
      "aria-required": required,
      value,
      defaultValue,
      maxLength,
      ...props,
    };

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
          {/* Prefix */}
          {prefix && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-500">
              {prefix}
            </div>
          )}

          {/* Left Icon */}
          {Icon && !prefix && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Icon className="w-5 h-5 text-neutral-400" aria-hidden="true" />
            </div>
          )}

          {/* Input or Textarea */}
          {multiline ? (
            <textarea ref={ref} rows={rows} {...inputProps} />
          ) : (
            <input {...inputProps} />
          )}

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
                <EyeOff className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Eye className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          )}

          {/* Clear Button */}
          {clearable && currentValue && !isPassword && (
            <button
              type="button"
              onClick={onClear}
              className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 hover:text-danger-500 transition-colors"
              tabIndex={-1}
              aria-label="پاک کردن"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          {/* Status Icon */}
          {!isPassword && !clearable && status === "error" && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <AlertCircle className="w-5 h-5 text-danger-500" aria-hidden="true" />
            </div>
          )}

          {!isPassword && !clearable && status === "success" && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <CheckCircle className="w-5 h-5 text-success-500" aria-hidden="true" />
            </div>
          )}

          {/* Suffix */}
          {suffix && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500">
              {suffix}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 text-xs text-danger-500 flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" aria-hidden="true" />
            {error}
          </p>
        )}

        {/* Hint */}
        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-xs text-neutral-400">
            {hint}
          </p>
        )}

        {/* Character Count */}
        {showCount && maxLength && (
          <div className="mt-1 text-xs text-neutral-400 text-left">
            {charCount} / {maxLength}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
