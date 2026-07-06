/**
 * ResponsiveWrapper.jsx
 * Path: src/components/ResponsiveWrapper.jsx
 * Description: Responsive wrapper for mobile/desktop content
 */

import React from "react";
import { cn } from "@utils/helpers";
import { useIsMobile, useIsTablet, useIsDesktop } from "@hooks/MobileDetect";

export const MobileOnly = ({ children, className = "" }) => {
  const isMobile = useIsMobile();
  if (!isMobile) return null;
  return <div className={cn("block md:hidden", className)}>{children}</div>;
};

export const DesktopOnly = ({ children, className = "" }) => {
  const isDesktop = useIsDesktop();
  if (!isDesktop) return null;
  return <div className={cn("hidden md:block", className)}>{children}</div>;
};

export const TabletOnly = ({ children, className = "" }) => {
  const isTablet = useIsTablet();
  if (!isTablet) return null;
  return (
    <div className={cn("hidden sm:block lg:hidden", className)}>{children}</div>
  );
};

export const MobileTabletOnly = ({ children, className = "" }) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  if (!isMobile && !isTablet) return null;
  return <div className={cn("block lg:hidden", className)}>{children}</div>;
};

export const ResponsiveGrid = ({
  children,
  mobileCols = 1,
  tabletCols = 2,
  desktopCols = 3,
  className = "",
}) => {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  return (
    <div
      className={cn(
        "grid gap-4",
        colClasses[mobileCols] || "grid-cols-1",
        `md:grid-cols-${tabletCols}`,
        `lg:grid-cols-${desktopCols}`,
        className,
      )}
    >
      {children}
    </div>
  );
};

export const ResponsiveCard = ({
  children,
  className = "",
  padding = "md",
  onClick = null,
}) => {
  const paddings = {
    none: "p-0",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-5 md:p-6",
    lg: "p-5 sm:p-6 md:p-8",
    xl: "p-6 sm:p-8 md:p-10",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-neutral-900 rounded-2xl shadow-soft w-full text-right transition-all",
        paddings[padding] || paddings.md,
        onClick && "cursor-pointer hover:shadow-medium",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default {
  MobileOnly,
  DesktopOnly,
  TabletOnly,
  MobileTabletOnly,
  ResponsiveGrid,
  ResponsiveCard,
};
