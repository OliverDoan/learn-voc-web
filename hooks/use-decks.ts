"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiFetch, apiPatch, apiPost } from "@/lib/api-client";
import type { Deck, DeckWithCounts } from "@/lib/types";
import type { DeckCreateInput, DeckUpdateInput } from "@/lib/schemas";

export const DECKS_KEY = ["decks"] as const;

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

export function useDeleteDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (deckId: string) => apiDelete<{ id: string }>(`/api/decks/${deckId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: DECKS_KEY }),
  });
}
