import { NextRequest } from "next/server";
import { handleError, ok } from "@/lib/api-helpers";
import {
  getCardsByIds,
  getGlobalReviewQueue,
  getReviewQueue,
  getTopicReviewQueue,
} from "@/lib/daily-queue";
import { isDeckUnlocked } from "@/lib/deck-progress";
import { parseTopicDeckId } from "@/lib/deck-topics";
import { parseQuickLimit } from "@/lib/quick-study";

interface RouteParams {
  params: Promise<{ deckId: string }>;
}

const MAX_SUBSET = 500;

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { deckId } = await params;
    const url = new URL(req.url);
    const idsParam = url.searchParams.get("ids")?.trim();
    // ?quick=N → phiên ngắn: giới hạn tổng số thẻ trong hàng đợi.
    const quickLimit = parseQuickLimit(url.searchParams.get("quick"));

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
        : await getGlobalReviewQueue(quickLimit);
      return ok(quickLimit ? queue.slice(0, quickLimit) : queue);
    }

    // deckId ảo "topic-N" → gộp toàn bộ thẻ của cả topic (5 unit), bỏ khóa & lịch SRS.
    const topicIndex = parseTopicDeckId(deckId);
    if (topicIndex !== null) {
      const queue = cardIds
        ? await getCardsByIds(cardIds)
        : await getTopicReviewQueue(topicIndex);
      return ok(quickLimit ? queue.slice(0, quickLimit) : queue);
    }

    if (cardIds) {
      const queue = await getReviewQueue(deckId, { cardIds, limit: quickLimit });
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
      limit: quickLimit,
    });
    return ok(queue);
  } catch (error) {
    return handleError(error);
  }
}
