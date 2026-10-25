"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Khoá localStorage — dùng chung mọi deck: ẩn ở một deck thì deck khác cũng ẩn. */
const STORAGE_KEY = "voca-deck-story-hidden";

const listeners = new Set<() => void>();

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function readHidden(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Ẩn/hiện cột Truyện chêm ở trang deck, ghi nhớ qua các lần mở trang. */
export function useStoryPanelHidden(): { hidden: boolean; toggle: () => void } {
  // Server render luôn hiện panel (mặc định) để không lệch bố cục trước khi hydrate.
  const hidden = useSyncExternalStore(subscribe, readHidden, () => false);

  const toggle = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, readHidden() ? "0" : "1");
    } catch {
      /* localStorage bị chặn — bỏ qua, panel giữ trạng thái cũ */
    }
    listeners.forEach((cb) => cb());
  }, []);

  return { hidden, toggle };
}
