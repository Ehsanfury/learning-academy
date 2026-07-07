/**
 * useResponsive.js
 * Path: src/hooks/useResponsive.js
 * Description: Responsive design hooks for mobile detection
 * Changes:
 * - ✅ FIXED: Added named export 'useResponsive'
 * - ✅ FIXED: matches variable name
 */

import { useState, useEffect } from "react";

/**
 * Hook to detect if screen matches a given media query
 * @param {string} query - Media query string (e.g., '(max-width: 768px)')
 * @returns {boolean} - True if screen matches the query
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (event) => {
      setMatches(event.matches);
    };

    // Add listener
    media.addEventListener("change", listener);

    // Cleanup
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [query]);

  return matches;
};

/**
 * Hook to detect if screen is mobile (max-width: 768px)
 * @returns {boolean} - True if screen is mobile
 */
export const useMobile = () => {
  return useMediaQuery("(max-width: 768px)");
};

/**
 * Hook to detect if screen is tablet (min-width: 769px and max-width: 1024px)
 * @returns {boolean} - True if screen is tablet
 */
export const useTablet = () => {
  return useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
};

/**
 * Hook to detect if screen is desktop (min-width: 1025px)
 * @returns {boolean} - True if screen is desktop
 */
export const useDesktop = () => {
  return useMediaQuery("(min-width: 1025px)");
};

/**
 * Hook to detect if screen is small mobile (max-width: 480px)
 * @returns {boolean} - True if screen is small mobile
 */
export const useSmallMobile = () => {
  return useMediaQuery("(max-width: 480px)");
};

/**
 * Hook to get current device type
 * @returns {string} - 'mobile' | 'tablet' | 'desktop'
 */
export const useDeviceType = () => {
  const isMobile = useMobile();
  const isTablet = useTablet();
  const isDesktop = useDesktop();

  if (isMobile) return "mobile";
  if (isTablet) return "tablet";
  return "desktop";
};

/**
 * ✅ FIXED: Main responsive hook for App.jsx
 * Returns breakpoint information for responsive design
 */
export const useResponsive = () => {
  const isMobile = useMobile();
  const isTablet = useTablet();
  const isDesktop = useDesktop();
  const isSmallMobile = useSmallMobile();

  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallMobile,
    isMobileOrTablet: isMobile || isTablet,
    deviceType: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
  };
};

export default {
  useMediaQuery,
  useMobile,
  useTablet,
  useDesktop,
  useSmallMobile,
  useDeviceType,
  useResponsive,
};
