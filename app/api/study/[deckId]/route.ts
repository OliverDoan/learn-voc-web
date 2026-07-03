import { NextRequest } from "next/server";
import { handleError, ok } from "@/lib/api-helpers";
import {
  getCardsByIds,
  getGlobalReviewQueue,
  getReviewQueue,
} from "@/lib/daily-queue";
import { isDeckUnlocked } from "@/lib/deck-progress";

interface RouteParams {
  params: Promise<{ deckId: string }>;
}

const MAX_SUBSET = 500;

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { deckId } = await params;
    const url = new URL(req.url);
    const idsParam = url.searchParams.get("ids")?.trim();

    const cardIds = idsParam
      ? idsParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, MAX_SUBSET)
      : null;

    // deckId ảo "all" → ôn liên deck (gộp mọi deck)
    if (deckId === "all") {
      const queue = cardIds
        ? await getCardsByIds(cardIds)
        : await getGlobalReviewQueue();
      return ok(queue);
    }

    if (cardIds) {
      const queue = await getReviewQueue(deckId, { cardIds });
      return ok(queue);
    }

    // Deck bị khóa (Unit trước chưa học xong) → trả queue rỗng để trang Học hiện màn hình khóa.
    if (!(await isDeckUnlocked(deckId))) {
      return ok([]);
    }

    // ?all=1 → ôn trước hạn: toàn bộ thẻ của deck, bỏ qua lịch SRS.
    const ignoreSchedule = url.searchParams.get("all") === "1";

    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const queue = await getReviewQueue(deckId, {
      newCardLimit: Number.isFinite(limit) ? limit : undefined,
      ignoreSchedule,
    });
    return ok(queue);
  } catch (error) {
    return handleError(error);
  }
}
