"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useReorderCards } from "./use-cards";
import type { Card } from "@/lib/types";

export interface CardReorder {
  /** Thứ tự đang hiển thị (đã áp dụng cập nhật lạc quan khi kéo-thả). */
  orderedCards: Card[];
  dragId: string | null;
  overId: string | null;
  /** Chỉ cho phép kéo khi người dùng bấm vào tay nắm. */
  dragArmed: React.MutableRefObject<boolean>;
  setDragId: (id: string | null) => void;
  setOverId: (id: string | null) => void;
  handleDrop: (targetId: string) => Promise<void>;
  resetDrag: () => void;
}

/**
 * Kéo-thả sắp xếp thẻ trong deck với cập nhật lạc quan.
 *
 * Thứ tự cục bộ chỉ tồn tại trong lúc kéo: khi `cards` từ server đổi (và
 * `pendingOrder` chưa được đặt), danh sách hiển thị lấy thẳng từ server —
 * nhờ vậy không cần effect đồng bộ state.
 */
export function useCardReorder(deckId: string, cards: readonly Card[]): CardReorder {
  const reorderMut = useReorderCards();
  const [pendingOrder, setPendingOrder] = useState<Card[] | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const dragArmed = useRef(false);

  // Thứ tự lạc quan chỉ dùng khi vẫn khớp tập thẻ hiện tại của server.
  const orderedCards = useMemo(
    () =>
      pendingOrder && pendingOrder.length === cards.length
        ? pendingOrder
        : [...cards],
    [pendingOrder, cards],
  );

  const resetDrag = useCallback(() => {
    setDragId(null);
    setOverId(null);
    dragArmed.current = false;
  }, []);

  const handleDrop = useCallback(
    async (targetId: string) => {
      const sourceId = dragId;
      resetDrag();
      if (!sourceId || sourceId === targetId) return;

      const current = orderedCards;
      const from = current.findIndex((c) => c.id === sourceId);
      const to = current.findIndex((c) => c.id === targetId);
      if (from === -1 || to === -1) return;

      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      setPendingOrder(next);

      try {
        await reorderMut.mutateAsync({ deckId, orderedIds: next.map((c) => c.id) });
      } catch (error) {
        setPendingOrder(null); // trả về thứ tự của server
        toast.error(error instanceof Error ? error.message : "Lỗi khi sắp xếp");
      }
    },
    [deckId, dragId, orderedCards, reorderMut, resetDrag],
  );

  return {
    orderedCards,
    dragId,
    overId,
    dragArmed,
    setDragId,
    setOverId,
    handleDrop,
    resetDrag,
  };
}
