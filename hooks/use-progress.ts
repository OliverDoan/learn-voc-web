"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { UserProgress } from "@/lib/types";

export interface StatsSeriesPoint {
  date: string;
  reviewed: number;
  learned: number;
  correct: number;
  total: number;
  xp: number;
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
