"use client";

import { toast } from "sonner";
import type { Rating } from "@/lib/constants";
import { useSubmitReview } from "./use-study";
import { useBulkCards, useToggleFavorite, useTrashAction, type CardWithDeck } from "./use-cards";
import { useSnoozeCard } from "./use-inbox";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/**
 * Các thao tác trên "mail" (thẻ từ) dùng chung cho danh sách và trang đọc.
 * Mỗi hàm tự báo toast thành công/lỗi và trả về true khi thành công.
 */
export function useMailActions() {
  const review = useSubmitReview();
  const snoozeCard = useSnoozeCard();
  const favorite = useToggleFavorite();
  const bulk = useBulkCards();
  const trash = useTrashAction();

  const rate = async (cards: readonly CardWithDeck[], rating: Rating, done: string) => {
    try {
      await Promise.all(cards.map((c) => review.mutateAsync({ cardId: c.id, rating, timeTakenMs: 0 })));
      toast.success(cards.length === 1 ? `${done}: "${cards[0].word}"` : `${done} ${cards.length} từ`);
      return true;
    } catch (error) {
      toast.error(errorMessage(error, "Không lưu được kết quả ôn"));
      return false;
    }
  };

  const snooze = async (cards: readonly CardWithDeck[], days: number) => {
    try {
      await Promise.all(cards.map((c) => snoozeCard.mutateAsync({ cardId: c.id, days })));
      toast.success(`Đã tạm ẩn ${cards.length} từ tới ${days} ngày sau`);
      return true;
    } catch (error) {
      toast.error(errorMessage(error, "Không tạm ẩn được"));
      return false;
    }
  };

  const toggleStar = async (card: CardWithDeck) => {
    try {
      await favorite.mutateAsync({ cardId: card.id, favorite: !card.favorite });
      return true;
    } catch (error) {
      toast.error(errorMessage(error, "Không đổi được dấu sao"));
      return false;
    }
  };

  const restore = async (ids: string[]) => {
    try {
      await trash.mutateAsync({ action: "restore", ids });
      toast.success(`Đã khôi phục ${ids.length} từ`);
      return true;
    } catch (error) {
      toast.error(errorMessage(error, "Không khôi phục được"));
      return false;
    }
  };

  const remove = async (cards: readonly CardWithDeck[]) => {
    const ids = cards.map((c) => c.id);
    try {
      await bulk.mutateAsync({ action: "delete", ids });
      toast.success(`Đã chuyển ${ids.length} từ vào thùng rác`, {
        action: { label: "Hoàn tác", onClick: () => void restore(ids) },
      });
      return true;
    } catch (error) {
      toast.error(errorMessage(error, "Không xoá được"));
      return false;
    }
  };

  const purge = async (ids: string[]) => {
    try {
      await trash.mutateAsync({ action: "purge", ids });
      toast.success(`Đã xoá vĩnh viễn ${ids.length} từ`);
      return true;
    } catch (error) {
      toast.error(errorMessage(error, "Không xoá vĩnh viễn được"));
      return false;
    }
  };

  return {
    /** Lưu trữ = đã thuộc (chấm Dễ). */
    archive: (cards: readonly CardWithDeck[]) => rate(cards, 4, "Đã thuộc"),
    /** Đánh dấu đã đọc = ôn đạt (chấm Tốt). */
    markRead: (cards: readonly CardWithDeck[]) => rate(cards, 3, "Đã ôn"),
    rate: (card: CardWithDeck, rating: Rating) => rate([card], rating, "Đã ghi kết quả"),
    snooze,
    toggleStar,
    remove,
    restore,
    purge,
    isBusy: review.isPending || snoozeCard.isPending || bulk.isPending || trash.isPending,
  };
}
