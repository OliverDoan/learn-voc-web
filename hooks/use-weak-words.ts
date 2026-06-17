"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface WeakWord {
  id: string;
  word: string;
  meaning: string;
  deckId: string;
  deckName: string;
  wrong: number;
  total: number;
  errorRate: number;
}

export function useWeakWords() {
  return useQuery({
    queryKey: ["weak-words"],
    queryFn: () => apiFetch<WeakWord[]>("/api/weak-words"),
    staleTime: 60_000,
  });
}
