"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Card } from "@/lib/types";

export interface CardSelection {
  selectMode: boolean;
  selectedIds: Set<string>;
  /** Mọi thẻ đang hiển thị đều đã được chọn. */
  allVisibleSelected: boolean;
  toggleSelectMode: () => void;
  toggleCard: (cardId: string) => void;
  toggleAllVisible: () => void;
  clear: () => void;
  /** Mở một hoạt động (study/quiz/flashcards/pronounce) với đúng các thẻ đã chọn. */
  openWithSelection: (
    activity: "study" | "quiz" | "flashcards" | "pronounce",
  ) => void;
}

/**
 * Chế độ chọn nhiều thẻ trong trang deck: giữ danh sách id đã chọn và điều
 * hướng sang các hoạt động học với đúng tập thẻ đó.
 */
export function useCardSelection(
  deckId: string,
  visibleCards: readonly Card[],
): CardSelection {
  const router = useRouter();
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const toggleSelectMode = useCallback(() => {
    setSelectMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  }, []);

  const toggleCard = useCallback((cardId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  }, []);

  const allVisibleSelected = useMemo(
    () =>
      visibleCards.length > 0 && visibleCards.every((c) => selectedIds.has(c.id)),
    [visibleCards, selectedIds],
  );

  const toggleAllVisible = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (visibleCards.every((c) => next.has(c.id)) && visibleCards.length > 0) {
        for (const c of visibleCards) next.delete(c.id);
      } else {
        for (const c of visibleCards) next.add(c.id);
      }
      return next;
    });
  }, [visibleCards]);

  const clear = useCallback(() => setSelectedIds(new Set()), []);

  const openWithSelection = useCallback(
    (activity: "study" | "quiz" | "flashcards" | "pronounce") => {
      if (selectedIds.size === 0) return;
      const ids = Array.from(selectedIds).join(",");
      router.push(`/${activity}/${deckId}?ids=${encodeURIComponent(ids)}`);
    },
    [deckId, router, selectedIds],
  );

  return {
    selectMode,
    selectedIds,
    allVisibleSelected,
    toggleSelectMode,
    toggleCard,
    toggleAllVisible,
    clear,
    openWithSelection,
  };
}
