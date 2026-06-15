import { createContext, useContext, useEffect, useState, useCallback } from "react";
type Theme = "dark" | "light";
interface ThemeContextValue { theme: Theme; toggleTheme: () => void; }
const ThemeContext = createContext<ThemeContextValue>({ theme: "dark", toggleTheme: () => {} });
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try { return (localStorage.getItem("snpsu_theme") as Theme) ?? "dark"; }
    catch { return "dark"; }
  });
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") { root.classList.add("light"); } else { root.classList.remove("light"); }
    localStorage.setItem("snpsu_theme", theme);
  }, [theme]);
  const toggleTheme = useCallback(() => { setTheme((t) => (t === "dark" ? "light" : "dark")); }, []);
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
