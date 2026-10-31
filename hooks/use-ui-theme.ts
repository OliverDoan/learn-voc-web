"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_UI_THEME, parseUiTheme, UI_THEME_STORAGE_KEY, type UiTheme } from "@/lib/ui-theme";

const listeners = new Set<() => void>();

function getSnapshot(): UiTheme {
  try {
    return parseUiTheme(localStorage.getItem(UI_THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_UI_THEME;
  }
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function setUiTheme(next: UiTheme): void {
  try {
    localStorage.setItem(UI_THEME_STORAGE_KEY, next);
  } catch {
    /* localStorage bị chặn — chỉ đổi trong phiên */
  }
  // Bảng màu + font chọn theo thuộc tính này (xem app/globals.css).
  document.documentElement.dataset.ui = next;
  listeners.forEach((cb) => cb());
}

/** Kiểu giao diện hiện tại. SSR trả mặc định, client đồng bộ sau hydrate. */
export function useUiTheme(): UiTheme {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_UI_THEME);
}
