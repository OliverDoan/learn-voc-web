"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { HistoryData } from "@/lib/types";

export const HISTORY_KEY = ["history"] as const;

/** Lịch sử làm bài + danh sách câu sai cần ôn (across tất cả deck). */
export function useHistory() {
  return useQuery({
    queryKey: HISTORY_KEY,
    queryFn: () => apiFetch<HistoryData>("/api/history"),
  });
}
