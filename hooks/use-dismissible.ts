"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Khoá theo ngày để mỗi lời nhắc chỉ ẩn trong ngày hôm đó. */
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/**
 * Đã ẩn thông báo/banner này trong hôm nay chưa.
 * Server render luôn trả true (ẩn) để không nháy banner trước khi hydrate.
 */
export function useDismissedToday(storageKey: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(storageKey) === todayKey(),
    () => true,
  );
}

/** Ẩn banner cho tới hết ngày hôm nay. */
export function dismissForToday(storageKey: string): void {
  try {
    localStorage.setItem(storageKey, todayKey());
  } catch {
    /* localStorage bị chặn — bỏ qua, banner chỉ hiện lại ở lần sau */
  }
  listeners.forEach((cb) => cb());
}
