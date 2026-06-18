"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  isTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type Theme,
} from "@/lib/theme";
import {
  DEFAULT_PALETTE_ID,
  FOCUS_THEMES,
  getFocusTheme,
  PALETTE_VAR_KEYS,
} from "@/lib/focus-themes";

export const PALETTE_STORAGE_KEY = "voca-palette";

interface ThemeContextValue {
  theme: Theme;
  resolved: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  palette: string;
  setPalette: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// --- External store: light/dark + palette đọc từ localStorage ---
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function readTheme(): Theme {
  const stored =
    typeof localStorage !== "undefined" ? localStorage.getItem(THEME_STORAGE_KEY) : null;
  return isTheme(stored) ? stored : "light";
}

function readPalette(): string {
  const stored =
    typeof localStorage !== "undefined"
      ? localStorage.getItem(PALETTE_STORAGE_KEY)
      : null;
  return stored && FOCUS_THEMES.some((t) => t.id === stored)
    ? stored
    : DEFAULT_PALETTE_ID;
}

/** Độ phân giải sáng/tối thực tế đang hiển thị (palette ưu tiên hơn light/dark). */
function resolveAppearance(theme: Theme, paletteId: string): ResolvedTheme {
  const palette = getFocusTheme(paletteId);
  if (palette.surface) return palette.isDark ? "dark" : "light";
  return resolveTheme(theme);
}

/** Áp palette + light/dark lên <html>. Chỉ đụng DOM, không setState. */
function applyAppearance(theme: Theme, paletteId: string): void {
  const root = document.documentElement;
  for (const key of PALETTE_VAR_KEYS) root.style.removeProperty(key);

  const palette = getFocusTheme(paletteId);
  const resolved = resolveAppearance(theme, paletteId);

  if (palette.surface) {
    for (const [key, value] of Object.entries(palette.vars)) {
      root.style.setProperty(key, value);
    }
    root.style.setProperty("--background", palette.surface);
  }

  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore<Theme>(
    subscribe,
    readTheme,
    () => "light",
  );
  const palette = useSyncExternalStore(
    subscribe,
    readPalette,
    () => DEFAULT_PALETTE_ID,
  );

  // Đồng bộ DOM mỗi khi đổi theme/palette + theo dõi thay đổi của hệ điều hành
  useEffect(() => {
    applyAppearance(theme, palette);
    const followsSystem =
      theme === "system" && getFocusTheme(palette).surface === null;
    if (!followsSystem) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyAppearance(theme, palette);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme, palette]);

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, next);
    emit();
  }, []);

  const setPalette = useCallback((id: string) => {
    localStorage.setItem(PALETTE_STORAGE_KEY, id);
    emit();
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolved: resolveAppearance(theme, palette),
      setTheme,
      palette,
      setPalette,
    }),
    [theme, palette, setTheme, setPalette],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}
