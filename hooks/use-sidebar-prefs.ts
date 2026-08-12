"use client";

import { useSyncExternalStore } from "react";
import {
  getHiddenServerSnapshot,
  getHiddenSnapshot,
  subscribeHidden,
} from "@/lib/sidebar-prefs";

/** Tập href các mục sidebar đang bị ẩn (cập nhật live khi đổi trong Cài đặt). */
export function useHiddenNavItems(): ReadonlySet<string> {
  return useSyncExternalStore(subscribeHidden, getHiddenSnapshot, getHiddenServerSnapshot);
}
