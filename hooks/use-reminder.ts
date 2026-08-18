"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_REMINDER,
  loadReminderSettings,
  saveReminderSettings,
  type ReminderSettings,
} from "@/lib/reminder";

export type NotificationPermissionState = NotificationPermission | "unsupported";

const listeners = new Set<() => void>();

/** Cache để getSnapshot trả về cùng một tham chiếu giữa các lần render. */
let cached: ReminderSettings | null = null;

function emit(): void {
  listeners.forEach((cb) => cb());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): ReminderSettings {
  if (!cached) cached = loadReminderSettings();
  return cached;
}

function getServerSnapshot(): ReminderSettings {
  return DEFAULT_REMINDER;
}

/** Cấu hình nhắc học hiện tại (đồng bộ giữa mọi component đang mở). */
export function useReminderSettings(): ReminderSettings {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Ghi cấu hình mới xuống localStorage và báo cho mọi component đang nghe. */
export function setReminderSettings(next: ReminderSettings): void {
  cached = next;
  saveReminderSettings(next);
  emit();
}

function getPermissionSnapshot(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

function getPermissionServerSnapshot(): NotificationPermissionState {
  return "default";
}

/** Quyền thông báo hiện tại của trình duyệt. */
export function useNotificationPermission(): NotificationPermissionState {
  return useSyncExternalStore(
    subscribe,
    getPermissionSnapshot,
    getPermissionServerSnapshot,
  );
}

/** Gọi sau khi xin quyền để mọi component đọc lại trạng thái mới. */
export function refreshNotificationPermission(): void {
  emit();
}
