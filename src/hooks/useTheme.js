import { useThemeContext } from "@context/ThemeContext";

function useTheme() {
  const theme = useThemeContext();

  return {
    theme: theme.theme,
    isDark: theme.isDark,
    toggleTheme: theme.toggleTheme,
    setLightTheme: () => theme.setTheme("light"),
    setDarkTheme: () => theme.setTheme("dark"),
  };
}

export default useTheme;
