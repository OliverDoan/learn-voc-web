"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiFetch, apiPatch, apiPost } from "@/lib/api-client";
import type { Story, StoryWithCards } from "@/lib/types";
import type { StoryCreateInput, StoryUpdateInput } from "@/lib/schemas";

export function useStories(deckId?: string) {
  return useQuery({
    queryKey: ["stories", { deckId }],
    queryFn: () =>
      apiFetch<Array<Story & { _count: { storyCards: number } }>>(
        `/api/stories${deckId ? `?deckId=${deckId}` : ""}`,
      ),
  });
}

export function useStory(storyId: string | undefined) {
  return useQuery({
    queryKey: ["stories", storyId],
    queryFn: () => apiFetch<StoryWithCards>(`/api/stories/${storyId}`),
    enabled: !!storyId,
  });
}

export function useCreateStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StoryCreateInput) => apiPost<Story>("/api/stories", input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["stories"] });
      qc.invalidateQueries({ queryKey: ["decks", variables.deckId] });
    },
  });
}

export function useUpdateStory(storyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StoryUpdateInput) => apiPatch<Story>(`/api/stories/${storyId}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stories"] });
      qc.invalidateQueries({ queryKey: ["stories", storyId] });
    },
  });
}

export function useDeleteStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (storyId: string) => apiDelete<{ id: string }>(`/api/stories/${storyId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stories"] }),
  });
}

export function useMarkStoryRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (storyId: string) => apiPost<Story>(`/api/stories/${storyId}/read`, {}),
    onSuccess: (_d, storyId) => {
      qc.invalidateQueries({ queryKey: ["stories"] });
      qc.invalidateQueries({ queryKey: ["stories", storyId] });
    },
  });
}
