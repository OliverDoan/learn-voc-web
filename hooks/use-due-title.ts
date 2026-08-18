"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useDueCount } from "./use-due-count";

/** Bỏ tiền tố "(N) " cũ để không cộng dồn qua các lần cập nhật. */
function stripPrefix(title: string): string {
  return title.replace(/^\(\d+\)\s+/, "");
}

/**
 * Gắn số thẻ đến hạn vào tiêu đề tab: "(12) VocaLearn".
 * Chạy lại sau mỗi lần điều hướng vì Next đặt lại document.title theo metadata.
 */
export function useDueTitle(): void {
  const { due } = useDueCount();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const base = stripPrefix(document.title);
    document.title = due > 0 ? `(${due}) ${base}` : base;
    return () => {
      document.title = stripPrefix(document.title);
    };
  }, [due, pathname]);
}
