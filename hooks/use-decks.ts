"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiFetch, apiPatch, apiPost } from "@/lib/api-client";
import type { Deck, DeckWithCounts } from "@/lib/types";
import type {
  DeckCreateInput,
  DeckImportInput,
  DeckUpdateInput,
  TrashActionInput,
} from "@/lib/schemas";

export const DECKS_KEY = ["decks"] as const;
export const DECK_TRASH_KEY = ["decks", "trash"] as const;

export interface DeckImportResponse {
  deckId: string;
  deckName: string;
  count: number;
}

export interface TrashDeck extends Deck {
  _count: { cards: number; stories: number };
}

export function useDecks() {
  return useQuery({
    queryKey: DECKS_KEY,
    queryFn: () => apiFetch<DeckWithCounts[]>("/api/decks"),
  });
}

export function useDeck(deckId: string | undefined) {
  return useQuery({
    queryKey: ["decks", deckId],
    queryFn: () => apiFetch<DeckWithCounts>(`/api/decks/${deckId}`),
    enabled: !!deckId,
  });
}

export function useCreateDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DeckCreateInput) => apiPost<Deck>("/api/decks", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: DECKS_KEY }),
  });
}

export function useUpdateDeck(deckId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DeckUpdateInput) => apiPatch<Deck>(`/api/decks/${deckId}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DECKS_KEY });
      qc.invalidateQueries({ queryKey: ["decks", deckId] });
    },
  });
}

/** Đánh dấu / bỏ đánh dấu deck đã học xong (mở khóa tuần tự kiểu Duolingo). */
export function useSetDeckLearned(deckId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (learned: boolean) =>
      learned
        ? apiPost<Deck>(`/api/decks/${deckId}/learned`, {})
        : apiDelete<Deck>(`/api/decks/${deckId}/learned`),
    onSuccess: () => {
      // Toàn bộ trạng thái khóa của các deck khác có thể đổi → làm mới danh sách.
      qc.invalidateQueries({ queryKey: DECKS_KEY });
      qc.invalidateQueries({ queryKey: ["decks", deckId] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

/** Ghi nhận hoàn thành một dạng bài tập của deck (cập nhật thanh progress + điều kiện mở khóa). */
export function useRecordDeckActivity(deckId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { activity: string; accuracy?: number | null; wrongCardIds?: string[] }) =>
      apiPost<{ activity: string; bestAccuracy: number | null }>(
        `/api/decks/${deckId}/activity`,
        input,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["decks", deckId] });
      qc.invalidateQueries({ queryKey: DECKS_KEY });
    },
  });
}

export function useImportDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DeckImportInput) =>
      apiPost<DeckImportResponse>("/api/decks/import", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: DECKS_KEY }),
  });
}

export function useDeleteDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (deckId: string) => apiDelete<{ id: string }>(`/api/decks/${deckId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DECKS_KEY });
      qc.invalidateQueries({ queryKey: DECK_TRASH_KEY });
    },
  });
}

export function useDeckTrash() {
  return useQuery({
    queryKey: DECK_TRASH_KEY,
    queryFn: () => apiFetch<TrashDeck[]>("/api/decks/trash"),
  });
}

export function useDeckTrashAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TrashActionInput) =>
      apiPost<{ count: number; action: string }>("/api/decks/trash", input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DECKS_KEY });
      qc.invalidateQueries({ queryKey: DECK_TRASH_KEY });
      qc.invalidateQueries({ queryKey: ["cards"] });
    },
  });
}

/** Khôi phục nhanh 1 deck (dùng cho nút Hoàn tác sau khi xoá). */
export function useRestoreDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (deckId: string) =>
      apiPost<{ count: number; action: string }>("/api/decks/trash", {
        action: "restore",
        ids: [deckId],
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DECKS_KEY });
      qc.invalidateQueries({ queryKey: DECK_TRASH_KEY });
    },
  });
}
