"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { CardWithPractice } from "@/lib/types";

export const PRACTICE_SENTENCES_KEY = "practice-sentences";

/** Bộ câu ví dụ của MỘT thẻ (dùng cho hộp thoại chi tiết từ). */
export function useCardPracticeSentences(cardId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: [PRACTICE_SENTENCES_KEY, { cardId }],
    queryFn: async () => {
      const rows = await apiFetch<CardWithPractice[]>(
        `/api/practice-sentences?cardId=${cardId}`,
      );
      return rows[0]?.practiceSentences ?? [];
    },
    enabled: enabled && !!cardId,
  });
}

/** Thẻ của deck kèm bộ câu luyện viết (Việt → Anh). */
export function usePracticeSentences(deckId: string | undefined) {
  return useQuery({
    queryKey: [PRACTICE_SENTENCES_KEY, { deckId }],
    queryFn: () =>
      apiFetch<CardWithPractice[]>(`/api/practice-sentences?deckId=${deckId}`),
    enabled: !!deckId,
  });
}
