/**
 * useIsMobile.js
 * Path: src/hooks/useIsMobile.js
 * Description: Hook to detect mobile screen size with resize listener
 * Changes:
 * - L11: Fixed isMobile to use resize listener
 */

import { useState, useEffect } from "react";

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    // Initial check
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    // Ensure window is defined (for SSR)
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile;
};

export default useIsMobile;
