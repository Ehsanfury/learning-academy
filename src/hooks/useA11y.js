/**
 * useA11y.js
 * Path: src/hooks/useA11y.js
 * Description: Accessibility helper hooks
 * Version: 1.0 - New hook
 * Features:
 * - ✅ useFocusManagement - return focus to previous element
 * - ✅ useAnnounce - announce to screen readers
 * - ✅ useSkipLink - skip to main content
 * - ✅ useKeyboardNav - arrow key navigation for lists
 * - ✅ useReducedMotion - detect prefers-reduced-motion
 * - ✅ useHighContrast - detect prefers-contrast
 */

import { useEffect, useRef, useCallback, useState } from "react";

// ============================================
// 🎯 useFocusManagement - Return focus to trigger
// ============================================

export const useFocusManagement = () => {
  const previousFocus = useRef(null);

  const saveFocus = useCallback(() => {
    previousFocus.current = document.activeElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocus.current && previousFocus.current.focus) {
      previousFocus.current.focus();
    }
  }, []);

  const focusElement = useCallback((element) => {
    if (element && element.focus) {
      element.focus();
    }
  }, []);

  return { saveFocus, restoreFocus, focusElement };
};

// ============================================
// 📢 useAnnounce - Announce to screen readers
// ============================================

export const useAnnounce = () => {
  const announceRef = useRef(null);

  const announce = useCallback((message, type = "polite") => {
    if (!announceRef.current) {
      announceRef.current = document.createElement("div");
      announceRef.current.setAttribute("aria-live", type);
      announceRef.current.setAttribute("aria-atomic", "true");
      announceRef.current.className = "sr-only";
      document.body.appendChild(announceRef.current);
    }

    announceRef.current.setAttribute("aria-live", type);
    announceRef.current.textContent = "";

    // Force re-announcement
    setTimeout(() => {
      if (announceRef.current) {
        announceRef.current.textContent = message;
      }
    }, 50);
  }, []);

  useEffect(() => {
    return () => {
      if (announceRef.current && announceRef.current.parentNode) {
        announceRef.current.parentNode.removeChild(announceRef.current);
      }
    };
  }, []);

  return announce;
};

// ============================================
// ⌨️ useKeyboardNav - Arrow key navigation
// ============================================

export const useKeyboardNav = ({
  itemCount,
  onEnter,
  onEscape,
  orientation = "vertical",
}) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleKeyDown = useCallback(
    (e) => {
      if (itemCount === 0) return;

      const isVertical = orientation === "vertical";
      const nextKey = isVertical ? "ArrowDown" : "ArrowRight";
      const prevKey = isVertical ? "ArrowUp" : "ArrowLeft";

      switch (e.key) {
        case nextKey:
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % itemCount);
          break;
        case prevKey:
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount);
          break;
        case "Home":
          e.preventDefault();
          setActiveIndex(0);
          break;
        case "End":
          e.preventDefault();
          setActiveIndex(itemCount - 1);
          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && onEnter) {
            onEnter(activeIndex);
          }
          break;
        case "Escape":
          if (onEscape) {
            onEscape();
          }
          setActiveIndex(-1);
          break;
        default:
          break;
      }
    },
    [itemCount, activeIndex, onEnter, onEscape, orientation],
  );

  return { activeIndex, setActiveIndex, handleKeyDown };
};

// ============================================
// 🎬 useReducedMotion - Detect prefers-reduced-motion
// ============================================

export const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
};

// ============================================
// 🌓 useHighContrast - Detect prefers-contrast
// ============================================

export const useHighContrast = () => {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-contrast: more)");
    setHighContrast(mediaQuery.matches);

    const handler = (e) => setHighContrast(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return highContrast;
};

// ============================================
// 📋 useSkipLink - Skip to content
// ============================================

export const useSkipLink = (targetId = "main-content") => {
  const handleSkip = useCallback(() => {
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [targetId]);

  return handleSkip;
};

// ============================================
// 📦 Default export
// ============================================

export default {
  useFocusManagement,
  useAnnounce,
  useKeyboardNav,
  useReducedMotion,
  useHighContrast,
  useSkipLink,
};
