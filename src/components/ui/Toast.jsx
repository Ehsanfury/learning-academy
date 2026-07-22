/**
 * Toast.jsx
 * Path: src/components/ui/Toast.jsx
 * Description: Toast notification system - replacement for react-hot-toast
 * Version: 1.0 - New component
 * Features:
 * - ✅ Multiple types (success, error, warning, info, loading)
 * - ✅ Auto-dismiss with custom duration
 * - ✅ Manual dismiss
 * - ✅ Stacked toasts with animations
 * - ✅ ARIA live regions
 * - ✅ Action buttons (e.g., "Undo")
 * - ✅ Promise-based API (toast.promise)
 * - ✅ Custom icons
 * - ✅ RTL support
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@utils/helpers";

// ============================================
// 🎨 Toast Types
// ============================================

const types = {
  success: {
    icon: CheckCircle,
    iconColor: "text-success-500",
    bg: "bg-white dark:bg-neutral-900 border-success-200 dark:border-success-900",
  },
  error: {
    icon: XCircle,
    iconColor: "text-danger-500",
    bg: "bg-white dark:bg-neutral-900 border-danger-200 dark:border-danger-900",
  },
  warning: {
    icon: AlertCircle,
    iconColor: "text-warning-500",
    bg: "bg-white dark:bg-neutral-900 border-warning-200 dark:border-warning-900",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-500",
    bg: "bg-white dark:bg-neutral-900 border-blue-200 dark:border-blue-900",
  },
  loading: {
    icon: Loader2,
    iconColor: "text-primary-500",
    bg: "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800",
  },
};

// ============================================
// 📦 Toast Context
// ============================================

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children, position = "top-left" }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  // ============================================
  // 🗑️ Remove Toast
  // ============================================

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  // ============================================
  // ➕ Add Toast
  // ============================================

  const addToast = useCallback(
    (message, options = {}) => {
      const id = ++toastId;
      const {
        type = "default",
        duration = 4000,
        icon,
        action,
        actionLabel,
        onAction,
      } = options;

      const toast = {
        id,
        message,
        type,
        icon,
        action,
        actionLabel,
        onAction,
      };

      setToasts((prev) => [...prev, toast]);

      if (duration !== Infinity && type !== "loading") {
        timersRef.current[id] = setTimeout(() => {
          remove(id);
        }, duration);
      }

      return id;
    },
    [remove],
  );

  // ============================================
  // 🎨 Public API
  // ============================================

  const toast = useCallback(
    (message, options) => addToast(message, { ...options, type: "default" }),
    [addToast],
  );

  toast.success = (message, options) =>
    addToast(message, { ...options, type: "success" });
  toast.error = (message, options) =>
    addToast(message, { ...options, type: "error" });
  toast.warning = (message, options) =>
    addToast(message, { ...options, type: "warning" });
  toast.info = (message, options) =>
    addToast(message, { ...options, type: "info" });
  toast.loading = (message, options) =>
    addToast(message, { ...options, type: "loading", duration: Infinity });

  toast.dismiss = (id) => {
    if (id) {
      remove(id);
    } else {
      setToasts([]);
    }
  };

  toast.promise = async (promise, { loading, success, error }) => {
    const id = addToast(loading, { type: "loading", duration: Infinity });
    try {
      const result = await promise;
      remove(id);
      addToast(typeof success === "function" ? success(result) : success, {
        type: "success",
      });
      return result;
    } catch (err) {
      remove(id);
      addToast(typeof error === "function" ? error(err) : error, {
        type: "error",
      });
      throw err;
    }
  };

  // ============================================
  // 📍 Position Classes
  // ============================================

  const positionClasses = {
    "top-left": "top-4 left-4 items-start",
    "top-right": "top-4 right-4 items-start",
    "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
    "bottom-left": "bottom-4 left-4 items-start",
    "bottom-right": "bottom-4 right-4 items-start",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
  };

  // ============================================
  // 🖼️ Render
  // ============================================

  return (
    <ToastContext.Provider value={{ toast, remove }}>
      {children}

      {/* Toast Container */}
      <div
        className={cn(
          "fixed z-[100] flex flex-col gap-2 pointer-events-none",
          positionClasses[position] || positionClasses["top-left"],
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const config = types[t.type] || types.info;
            const Icon = t.icon || config.icon;
            const isLoading = t.type === "loading";

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "pointer-events-auto flex items-center gap-3 p-4 rounded-xl border shadow-lg max-w-sm w-full",
                  config.bg,
                )}
                role={t.type === "error" ? "alert" : "status"}
              >
                {/* Icon */}
                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    config.iconColor,
                    isLoading && "animate-spin",
                  )}
                  aria-hidden="true"
                />

                {/* Message */}
                <p className="flex-1 text-sm text-neutral-800 dark:text-neutral-100">
                  {t.message}
                </p>

                {/* Action */}
                {t.actionLabel && t.onAction && (
                  <button
                    type="button"
                    onClick={() => {
                      t.onAction();
                      remove(t.id);
                    }}
                    className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    {t.actionLabel}
                  </button>
                )}

                {/* Close Button */}
                {!isLoading && (
                  <button
                    type="button"
                    onClick={() => remove(t.id)}
                    className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                    aria-label="بستن"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// ============================================
// 🎣 useToast Hook
// ============================================

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context.toast;
};

export default ToastProvider;
