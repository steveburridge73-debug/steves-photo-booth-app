export type ThemeName = "dark" | "light";

const THEME_KEY = "pf-theme";

export function readTheme(): ThemeName {
  if (typeof localStorage === "undefined") return "dark";
  return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
}

export function writeTheme(theme: ThemeName) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

export function applyTheme(theme: ThemeName) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.style.colorScheme = theme;
}
