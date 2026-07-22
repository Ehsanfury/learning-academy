/**
 * Dialog.jsx
 * Path: src/components/ui/Dialog.jsx
 * Description: Confirmation/Dialog component built on top of Modal
 * Version: 1.0 - New component
 * Features:
 * - ✅ Confirm dialog (Yes/No)
 * - ✅ Alert dialog (single button)
 * - ✅ Custom actions
 * - ✅ Danger variant
 * - ✅ Loading state for confirm button
 * - ✅ ARIA roles
 */

import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@utils/helpers";

// ============================================
// 🎨 Variants
// ============================================

const variants = {
  default: {
    icon: Info,
    iconBg: "bg-primary-100 dark:bg-primary-950",
    iconColor: "text-primary-500",
  },
  danger: {
    icon: AlertTriangle,
    iconBg: "bg-danger-100 dark:bg-danger-950",
    iconColor: "text-danger-500",
  },
  success: {
    icon: CheckCircle,
    iconBg: "bg-success-100 dark:bg-success-950",
    iconColor: "text-success-500",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-warning-100 dark:bg-warning-950",
    iconColor: "text-warning-500",
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-100 dark:bg-blue-950",
    iconColor: "text-blue-500",
  },
  error: {
    icon: XCircle,
    iconBg: "bg-danger-100 dark:bg-danger-950",
    iconColor: "text-danger-500",
  },
};

// ============================================
// 🔄 Dialog Component
// ============================================

const Dialog = ({
  // ========== Core Props ==========
  isOpen = false,
  onClose,
  onConfirm,

  // ========== Display ==========
  title,
  message,
  variant = "default",

  // ========== Buttons ==========
  confirmText = "تأیید",
  cancelText = "انصراف",
  showCancel = true,
  confirmVariant,
  isLoading = false,

  // ========== Custom Actions ==========
  actions,

  // ========== A11y ==========
  closeOnOverlayClick = false,
}) => {
  const config = variants[variant] || variants.default;
  const Icon = config.icon;
  const finalConfirmVariant =
    confirmVariant || (variant === "danger" ? "danger" : "primary");

  // ============================================
  // 🖼️ Render
  // ============================================

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOverlayClick={closeOnOverlayClick && !isLoading}
      closeOnEsc={!isLoading}
      showCloseButton={false}
      className="!p-0"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
        className="p-6 text-center"
      >
        {/* Icon */}
        <div
          className={cn(
            "mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center",
            config.iconBg,
          )}
        >
          <Icon
            className={cn("w-8 h-8", config.iconColor)}
            aria-hidden="true"
          />
        </div>

        {/* Title */}
        {title && (
          <h2
            id="dialog-title"
            className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2"
          >
            {title}
          </h2>
        )}

        {/* Message */}
        {message && (
          <p
            id="dialog-message"
            className="text-sm text-neutral-600 dark:text-neutral-400 mb-6"
          >
            {message}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          {actions ? (
            actions
          ) : (
            <>
              {showCancel && (
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {cancelText}
                </Button>
              )}
              <Button
                variant={finalConfirmVariant}
                onClick={onConfirm}
                isLoading={isLoading}
              >
                {confirmText}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default Dialog;
