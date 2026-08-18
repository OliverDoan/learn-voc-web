"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { AchievementStats } from "@/lib/achievements";

export const ACHIEVEMENTS_KEY = ["achievements"] as const;

export interface AchievementsResponse {
  unlockedIds: string[];
  newIds: string[];
  stats: AchievementStats;
}

export function useAchievements() {
  return useQuery({
    queryKey: ACHIEVEMENTS_KEY,
    queryFn: () => apiFetch<AchievementsResponse>("/api/achievements"),
  });
}
