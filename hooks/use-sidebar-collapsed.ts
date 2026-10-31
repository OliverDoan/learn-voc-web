"use client";

import { useSyncExternalStore } from "react";

// Store nhỏ cho trạng thái thu gọn sidebar (nút ☰ ở top bar), lưu ở localStorage.
// Dùng useSyncExternalStore để SSR luôn trả về false (khớp server) rồi
// tự đồng bộ giá trị client sau hydrate — tránh lỗi hydration mismatch.
const COLLAPSED_KEY = "voc-sidebar-collapsed";
const listeners = new Set<() => void>();

function getSnapshot(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
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

function setCollapsed(next: boolean): void {
  try {
    localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
  } catch {
    /* localStorage bị chặn — chỉ đổi trong phiên */
  }
  listeners.forEach((cb) => cb());
}

export function useSidebarCollapsed(): [boolean, () => void] {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, () => false);
  return [collapsed, () => setCollapsed(!collapsed)];
}
