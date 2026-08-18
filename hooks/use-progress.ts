"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPatch, apiPost } from "@/lib/api-client";
import type { UserProgress } from "@/lib/types";

export interface ProgressUpdatePayload {
  dailyGoal?: number;
  freezeTokens?: number;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface StatsSeriesPoint {
  date: string;
  reviewed: number;
  learned: number;
  correct: number;
  total: number;
}

export interface StatsResponse {
  totalCards: number;
  series: StatsSeriesPoint[];
  stateDistribution: Array<{ state: string; count: number }>;
  topLapses: Array<{
    id: string;
    word: string;
    meaning: string;
    lapses: number;
    state: string;
    deckId: string;
  }>;
}

export function useProgress() {
  return useQuery({
    queryKey: ["progress"],
    queryFn: () => apiFetch<UserProgress>("/api/progress"),
  });
}

export function useStats(days: number) {
  return useQuery({
    queryKey: ["stats", days],
    queryFn: () => apiFetch<StatsResponse>(`/api/stats?days=${days}`),
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProgressUpdatePayload) =>
      apiPatch<UserProgress>("/api/progress", payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["progress"], data);
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });
}

export interface ResetResult {
  scope: "learned" | "all";
  decksUnlearned: number;
  reviewLogs?: number;
  dailyStats?: number;
  deckActivities?: number;
  exerciseAttempts?: number;
  achievements?: number;
  cardsReset?: number;
  favoritesCleared?: number;
}

/**
 * Đặt lại dữ liệu học. Sau khi xong phải làm mới toàn bộ cache vì gần như mọi
 * query (deck, thẻ, thống kê, huy hiệu) đều thay đổi.
 */
export function useResetProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scope: "learned" | "all") =>
      apiPost<ResetResult>("/api/progress/reset", { scope }),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

export function useResetStreak() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<UserProgress>("/api/progress/reset-streak", {}),
    onSuccess: (data) => {
      queryClient.setQueryData(["progress"], data);
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });
}
