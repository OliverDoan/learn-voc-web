export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "voca-theme";

export function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  return theme;
}

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}
