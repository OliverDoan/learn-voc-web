"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiFetch, apiPatch, apiPost } from "@/lib/api-client";
import type { Card } from "@/lib/types";
import type {
  BulkCardsInput,
  CardCreateInput,
  CardImportInput,
  CardReorderInput,
  CardUpdateInput,
  TrashActionInput,
} from "@/lib/schemas";

export const TRASH_KEY = ["cards", "trash"] as const;
export const FAVORITES_KEY = ["cards", "favorites"] as const;
export const ALL_WORDS_KEY = ["cards", "all-words"] as const;

export interface TrashCard extends Card {
  deck: { id: string; name: string; color: string; icon: string | null };
}

export interface FavoriteCard extends Card {
  deck: { id: string; name: string; color: string; icon: string | null };
}

/** Thẻ kèm thông tin deck nguồn (dùng cho trang tổng hợp tất cả từ). */
export type CardWithDeck = FavoriteCard;

export function useCards(
  params: { deckId?: string; state?: string; q?: string; topic?: number } = {},
) {
  const qs = new URLSearchParams();
  if (params.deckId) qs.set("deckId", params.deckId);
  if (params.state) qs.set("state", params.state);
  if (params.q) qs.set("q", params.q);
  if (params.topic !== undefined) qs.set("topic", String(params.topic));
  const search = qs.toString();
  return useQuery({
    queryKey: ["cards", params],
    queryFn: () => apiFetch<Card[]>(`/api/cards${search ? `?${search}` : ""}`),
  });
}

export function useCreateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CardCreateInput) => apiPost<Card>("/api/cards", input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: ["decks"] });
      qc.invalidateQueries({ queryKey: ["decks", variables.deckId] });
    },
  });
}

export function useUpdateCard(cardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CardUpdateInput) => apiPatch<Card>(`/api/cards/${cardId}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });
}

/** Bật/tắt đánh dấu yêu thích cho 1 thẻ. */
export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, favorite }: { cardId: string; favorite: boolean }) =>
      apiPatch<Card>(`/api/cards/${cardId}`, { favorite }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: FAVORITES_KEY });
    },
  });
}

/** Sắp xếp lại thứ tự thẻ trong deck (kéo-thả). */
export function useReorderCards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CardReorderInput) =>
      apiPatch<{ count: number }>("/api/cards/reorder", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });
}

/** Danh sách từ yêu thích across tất cả deck. */
export function useFavorites() {
  return useQuery({
    queryKey: FAVORITES_KEY,
    queryFn: () => apiFetch<FavoriteCard[]>("/api/cards/favorites"),
  });
}

/** Tổng hợp tất cả từ trong mọi deck (kèm thông tin deck nguồn). */
export function useAllWords() {
  return useQuery({
    queryKey: ALL_WORDS_KEY,
    queryFn: () => apiFetch<CardWithDeck[]>("/api/cards/all"),
  });
}

export function useDeleteCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) => apiDelete<{ id: string }>(`/api/cards/${cardId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: ["decks"] });
      qc.invalidateQueries({ queryKey: TRASH_KEY });
    },
  });
}

export function useTrash() {
  return useQuery({
    queryKey: TRASH_KEY,
    queryFn: () => apiFetch<TrashCard[]>("/api/cards/trash"),
  });
}

export function useTrashAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TrashActionInput) =>
      apiPost<{ count: number; action: string }>("/api/cards/trash", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: ["decks"] });
    },
  });
}

/** Khôi phục nhanh 1 thẻ (dùng cho nút Hoàn tác sau khi xoá). */
export function useRestoreCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) =>
      apiPost<{ count: number; action: string }>("/api/cards/trash", {
        action: "restore",
        ids: [cardId],
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: ["decks"] });
      qc.invalidateQueries({ queryKey: TRASH_KEY });
    },
  });
}

export function useImportCards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CardImportInput) =>
      apiPost<{ count: number }>("/api/cards/import", input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: ["decks"] });
      qc.invalidateQueries({ queryKey: ["decks", variables.deckId] });
    },
  });
}

export function useBulkCards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BulkCardsInput) =>
      apiPost<{ count: number; action: string }>("/api/cards/bulk", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: ["decks"] });
      qc.invalidateQueries({ queryKey: TRASH_KEY });
    },
  });
}
