/**
 * ThemeContext.jsx
 * Path: src/context/ThemeContext.jsx
 * Description: Theme context provider for dark/light/system mode
 * Version: 2.0 - Improved with system theme detection
 * Changes:
 * - ✅ Added system theme detection
 * - ✅ Three modes: light, dark, system
 * - ✅ Listen to system theme changes
 * - ✅ Better SSR safety
 * - ✅ Persist to localStorage
 * - ✅ Apply theme to document root
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

const ThemeContext = createContext(null);

// ============================================
// 🎨 Theme constants
// ============================================

const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

const STORAGE_KEY = "theme";

// ============================================
// 📦 Helper: Get system preference
// ============================================

const getSystemTheme = () => {
  if (typeof window === "undefined") return THEMES.LIGHT;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? THEMES.DARK
    : THEMES.LIGHT;
};

// ============================================
// 📦 Helper: Get stored theme
// ============================================

const getStoredTheme = () => {
  if (typeof window === "undefined") return THEMES.SYSTEM;
  return localStorage.getItem(STORAGE_KEY) || THEMES.SYSTEM;
};

// ============================================
// 🔄 ThemeProvider
// ============================================

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getStoredTheme);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  // ============================================
  // 📡 Listen to system theme changes
  // ============================================

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setSystemTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // ============================================
  // 🎨 Apply theme to document
  // ============================================

  const resolvedTheme = theme === THEMES.SYSTEM ? systemTheme : theme;

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    if (resolvedTheme === THEMES.DARK) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }

    localStorage.setItem(STORAGE_KEY, theme);

    // Meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        resolvedTheme === THEMES.DARK ? "#0a0a0a" : "#ffffff",
      );
    }
  }, [theme, resolvedTheme]);

  // ============================================
  // 🎛️ Actions
  // ============================================

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      if (prev === THEMES.LIGHT) return THEMES.DARK;
      if (prev === THEMES.DARK) return THEMES.SYSTEM;
      return THEMES.LIGHT;
    });
  }, []);

  const setLightTheme = useCallback(() => setTheme(THEMES.LIGHT), []);
  const setDarkTheme = useCallback(() => setTheme(THEMES.DARK), []);
  const setSystemThemeMode = useCallback(() => setTheme(THEMES.SYSTEM), []);

  // ============================================
  // 📦 Memoized value
  // ============================================

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      isDark: resolvedTheme === THEMES.DARK,
      isSystem: theme === THEMES.SYSTEM,
      toggleTheme,
      setTheme,
      setLightTheme,
      setDarkTheme,
      setSystemTheme: setSystemThemeMode,
    }),
    [
      theme,
      resolvedTheme,
      toggleTheme,
      setLightTheme,
      setDarkTheme,
      setSystemThemeMode,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// ============================================
// 🎣 useTheme hook
// ============================================

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return context;
}

// ✅ Alias for consistency
export const useTheme = useThemeContext;

export default ThemeContext;
