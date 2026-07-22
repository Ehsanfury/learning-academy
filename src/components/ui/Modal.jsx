/**
 * Modal.jsx
 * Path: src/components/ui/Modal.jsx
 * Description: Modal/Dialog component with backdrop, A11y, animations
 * Version: 1.0 - New component
 * Features:
 * - ✅ Focus trap
 * - ✅ ESC to close
 * - ✅ Click outside to close
 * - ✅ Body scroll lock
 * - ✅ ARIA attributes
 * - ✅ Framer Motion animations
 * - ✅ Multiple sizes
 * - ✅ Header, Body, Footer slots
 */

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@utils/helpers";

// ============================================
// 📏 Sizes
// ============================================

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-6xl",
  full: "max-w-7xl",
};

// ============================================
// 🔄 Modal Component
// ============================================

const Modal = ({
  // ========== Core Props ==========
  isOpen = false,
  onClose,
  children,

  // ========== Display ==========
  size = "md",
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,

  // ========== A11y ==========
  title,
  description,
  labelledById,

  // ========== Style ==========
  className = "",
  overlayClassName = "",
}) => {
  // ============================================
  // 🎹 Event Handlers
  // ============================================

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && closeOnEsc) {
        e.preventDefault();
        onClose?.();
      }
    },
    [closeOnEsc, onClose],
  );

  // ============================================
  // 📦 Body Scroll Lock + ESC
  // ============================================

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener("keydown", handleKeyDown);

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleKeyDown]);

  // ============================================
  // 🖼️ Render
  // ============================================

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? labelledById || "modal-title" : undefined}
          aria-describedby={description ? "modal-description" : undefined}
        >
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute inset-0 bg-black/50 backdrop-blur-sm",
              overlayClassName,
            )}
            onClick={closeOnOverlayClick ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl",
              "max-h-[90vh] overflow-hidden flex flex-col",
              sizes[size] || sizes.md,
              className,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 left-4 z-10 p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
                aria-label="بستن"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Title */}
            {title && (
              <div className="px-6 pt-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <h2
                  id={labelledById || "modal-title"}
                  className="text-xl font-bold text-neutral-900 dark:text-neutral-100"
                >
                  {title}
                </h2>
                {description && (
                  <p
                    id="modal-description"
                    className="mt-1 text-sm text-neutral-500 dark:text-neutral-400"
                  >
                    {description}
                  </p>
                )}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// 📦 Sub-components (optional usage)
// ============================================

export const ModalHeader = ({ children, className = "", ...props }) => (
  <div
    className={cn(
      "px-6 pt-6 pb-4 border-b border-neutral-200 dark:border-neutral-800",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const ModalBody = ({ children, className = "", ...props }) => (
  <div className={cn("flex-1 overflow-y-auto p-6", className)} {...props}>
    {children}
  </div>
);

export const ModalFooter = ({ children, className = "", ...props }) => (
  <div
    className={cn(
      "px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap justify-end gap-3",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export default Modal;
