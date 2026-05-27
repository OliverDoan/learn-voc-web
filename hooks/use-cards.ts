"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiFetch, apiPatch, apiPost } from "@/lib/api-client";
import type { Card } from "@/lib/types";
import type {
  BulkCardsInput,
  CardCreateInput,
  CardImportInput,
  CardUpdateInput,
} from "@/lib/schemas";

export function useCards(params: { deckId?: string; state?: string; q?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.deckId) qs.set("deckId", params.deckId);
  if (params.state) qs.set("state", params.state);
  if (params.q) qs.set("q", params.q);
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

export function useDeleteCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) => apiDelete<{ id: string }>(`/api/cards/${cardId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: ["decks"] });
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
    },
  });
}
