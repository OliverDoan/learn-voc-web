"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays, startOfDay } from "date-fns";
import { apiPatch } from "@/lib/api-client";
import type { Card } from "@/lib/types";
import type { InboxFolder } from "@/lib/inbox";
import { useAllWords, useTrash, type CardWithDeck } from "./use-cards";

/**
 * Danh sách "mail" theo thư mục: thùng rác lấy từ API thùng rác, còn lại lấy
 * toàn bộ từ (deck tiếng Anh đã mở khoá) rồi lọc ở client bằng `filterInbox`.
 */
export function useInboxSource(folder: InboxFolder) {
  const isTrash = folder === "trash";
  const all = useAllWords();
  const trash = useTrash();
  const query = isTrash ? trash : all;
  return {
    cards: (query.data ?? []) as CardWithDeck[],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/** "Tạm ẩn" thẻ: dời ngày ôn kế tiếp sang `days` ngày sau (đầu ngày). */
export function useSnoozeCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, days }: { cardId: string; days: number }) =>
      apiPatch<Card>(`/api/cards/${cardId}`, {
        nextReviewDate: startOfDay(addDays(new Date(), days)),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: ["decks"] });
    },
  });
}
