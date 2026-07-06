/**
 * Tooltip.jsx
 * Path: src/components/ui/Tooltip.jsx
 * Description: Tooltip component with multiple positions
 * Version: 2.0 - Improved with more features and animations
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@utils/helpers";

// ============================================
// 🎨 Positions
// ============================================

const positions = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  topLeft: "bottom-full left-0 mb-2",
  topRight: "bottom-full right-0 mb-2",

  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  bottomLeft: "top-full left-0 mt-2",
  bottomRight: "top-full right-0 mt-2",

  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  leftTop: "right-full top-0 mr-2",
  leftBottom: "right-full bottom-0 mr-2",

  right: "left-full top-1/2 -translate-y-1/2 ml-2",
  rightTop: "left-full top-0 ml-2",
  rightBottom: "left-full bottom-0 ml-2",
};

// ============================================
// 🎯 Arrow Positions
// ============================================

const arrows = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-neutral-800 dark:border-t-neutral-200 border-l-transparent border-r-transparent border-b-transparent",
  topLeft:
    "top-full left-4 border-t-neutral-800 dark:border-t-neutral-200 border-l-transparent border-r-transparent border-b-transparent",
  topRight:
    "top-full right-4 border-t-neutral-800 dark:border-t-neutral-200 border-l-transparent border-r-transparent border-b-transparent",

  bottom:
    "bottom-full left-1/2 -translate-x-1/2 border-b-neutral-800 dark:border-b-neutral-200 border-l-transparent border-r-transparent border-t-transparent",
  bottomLeft:
    "bottom-full left-4 border-b-neutral-800 dark:border-b-neutral-200 border-l-transparent border-r-transparent border-t-transparent",
  bottomRight:
    "bottom-full right-4 border-b-neutral-800 dark:border-b-neutral-200 border-l-transparent border-r-transparent border-t-transparent",

  left: "left-full top-1/2 -translate-y-1/2 border-l-neutral-800 dark:border-l-neutral-200 border-t-transparent border-b-transparent border-r-transparent",
  leftTop:
    "left-full top-4 border-l-neutral-800 dark:border-l-neutral-200 border-t-transparent border-b-transparent border-r-transparent",
  leftBottom:
    "left-full bottom-4 border-l-neutral-800 dark:border-l-neutral-200 border-t-transparent border-b-transparent border-r-transparent",

  right:
    "right-full top-1/2 -translate-y-1/2 border-r-neutral-800 dark:border-r-neutral-200 border-t-transparent border-b-transparent border-l-transparent",
  rightTop:
    "right-full top-4 border-r-neutral-800 dark:border-r-neutral-200 border-t-transparent border-b-transparent border-l-transparent",
  rightBottom:
    "right-full bottom-4 border-r-neutral-800 dark:border-r-neutral-200 border-t-transparent border-b-transparent border-l-transparent",
};

// ============================================
// 🎨 Variants
// ============================================

const variants = {
  dark: "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900",
  light:
    "bg-white text-neutral-800 dark:bg-neutral-900 dark:text-white shadow-lg",
  primary: "bg-primary-500 text-white",
  danger: "bg-danger-500 text-white",
  success: "bg-success-500 text-white",
  warning: "bg-warning-500 text-white",
};

// ============================================
// 🔤 Tooltip Component
// ============================================

function Tooltip({
  children,
  content,
  position = "top",
  className = "",

  // ========== Variant ==========
  variant = "dark",

  // ========== Animation ==========
  delay = 200,

  // ========== Trigger ==========
  trigger = "hover", // hover | click | both

  // ========== State ==========
  open = null,
  onOpenChange = null,

  // ========== Disabled ==========
  disabled = false,

  // ========== Arrow ==========
  showArrow = true,

  // ========== Max Width ==========
  maxWidth = "w-64",

  ...props
}) {
  // ============================================
  // 📊 State
  // ============================================

  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const timeoutRef = useRef(null);

  // ============================================
  // 🎯 Computed
  // ============================================

  const isOpen = open !== null ? open : isVisible;
  const positionKey = position;
  const arrowKey = position;

  // ============================================
  // 🎯 Effects
  // ============================================

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // ============================================
  // 🎯 Handlers
  // ============================================

  const show = () => {
    if (disabled) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(true);
    onOpenChange?.(true);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (trigger === "click") {
        if (!isClicked) {
          setIsVisible(false);
          onOpenChange?.(false);
        }
      } else {
        setIsVisible(false);
        onOpenChange?.(false);
      }
    }, 100);
  };

  const handleMouseEnter = () => {
    if (trigger === "hover" || trigger === "both") {
      setIsHovering(true);
      show();
    }
  };

  const handleMouseLeave = () => {
    if (trigger === "hover" || trigger === "both") {
      setIsHovering(false);
      hide();
    }
  };

  const handleClick = () => {
    if (trigger === "click" || trigger === "both") {
      setIsClicked(!isClicked);
      if (!isClicked) {
        show();
      } else {
        hide();
      }
    }
  };

  // ============================================
  // 🖼️ Render
  // ============================================

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      {...props}
    >
      {/* Trigger */}
      {children}

      {/* Tooltip */}
      <AnimatePresence>
        {isOpen && content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 px-3 py-1.5 text-xs font-medium rounded-lg shadow-lg whitespace-nowrap pointer-events-none",
              positions[positionKey],
              maxWidth,
              variants[variant] || variants.dark,
              className,
            )}
          >
            {/* Arrow */}
            {showArrow && (
              <div className={cn("absolute border-4", arrows[arrowKey])} />
            )}

            {/* Content */}
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Tooltip;
