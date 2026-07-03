"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPost } from "@/lib/api-client";
import type { QueueCard } from "@/lib/daily-queue";
import type { ReviewInput } from "@/lib/schemas";
import type { SRSOutput } from "@/lib/srs";

interface ReviewResponse {
  card: unknown;
  srs: SRSOutput;
  progress: unknown;
}

export function useStudyQueue(
  deckId: string | undefined,
  cardIds?: readonly string[],
  /** true = ôn trước hạn: lấy toàn bộ thẻ của deck, bỏ qua lịch SRS. */
  allCards?: boolean,
) {
  const idsParam = cardIds && cardIds.length > 0 ? cardIds.join(",") : "";
  const query = idsParam
    ? `?ids=${encodeURIComponent(idsParam)}`
    : allCards
      ? "?all=1"
      : "";
  return useQuery({
    queryKey: ["study", deckId, idsParam, allCards ?? false],
    queryFn: () => apiFetch<QueueCard[]>(`/api/study/${deckId}${query}`),
    enabled: !!deckId,
    staleTime: 0,
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReviewInput) => apiPost<ReviewResponse>("/api/review", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["decks"] });
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: ["progress"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["weak-words"] });
    },
  });
}
