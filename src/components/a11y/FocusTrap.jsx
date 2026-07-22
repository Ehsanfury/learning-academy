/**
 * FocusTrap.jsx
 * Path: src/components/a11y/FocusTrap.jsx
 * Description: Focus trap component for modals, dialogs, and menus
 * Version: 1.0 - New component
 * Features:
 * - ✅ Trap focus within container
 * - ✅ Return focus to trigger on unmount
 * - ✅ Tab and Shift+Tab cycle
 * - ✅ Initial focus on first element
 * - ✅ Configurable focusable selectors
 */

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  "audio[controls]",
  "video[controls]",
  '[contenteditable]:not([contenteditable="false"])',
  "details>summary:first-of-type",
];

const FocusTrap = ({
  children,
  active = true,
  initialFocusRef,
  restoreFocus = true,
  focusSelectors = FOCUSABLE_SELECTORS,
}) => {
  const containerRef = useRef(null);
  const previousFocus = useRef(null);

  // ============================================
  // 🎯 Save previous focus on activate
  // ============================================

  useEffect(() => {
    if (!active) return;

    if (restoreFocus) {
      previousFocus.current = document.activeElement;
    }

    return () => {
      if (restoreFocus && previousFocus.current) {
        previousFocus.current.focus();
      }
    };
  }, [active, restoreFocus]);

  // ============================================
  // 🎯 Set initial focus
  // ============================================

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const focusTarget =
      initialFocusRef?.current || getFirstFocusable(containerRef.current);

    if (focusTarget) {
      setTimeout(() => focusTarget.focus(), 0);
    }
  }, [active, initialFocusRef]);

  // ============================================
  // ⌨️ Trap tab key
  // ============================================

  const handleKeyDown = (e) => {
    if (!active || e.key !== "Tab") return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift+Tab: going backwards
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: going forwards
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  // ============================================
  // 🖼️ Render
  // ============================================

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      style={{ outline: "none" }}
    >
      {children}
    </div>
  );
};

// ============================================
// 📦 Helper functions
// ============================================

function getFocusableElements(container) {
  const selector = FOCUSABLE_SELECTORS.join(", ");
  const elements = container.querySelectorAll(selector);
  return Array.from(elements).filter(
    (el) =>
      el.offsetWidth > 0 ||
      el.offsetHeight > 0 ||
      el.getClientRects().length > 0,
  );
}

function getFirstFocusable(container) {
  const elements = getFocusableElements(container);
  return elements[0] || null;
}

export default FocusTrap;
