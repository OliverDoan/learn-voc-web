import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api-helpers";
import { getLockedDeckIds } from "@/lib/deck-progress";

/** Các cột của PracticeSentence trả về cho client (bỏ createdAt/updatedAt). */
const SENTENCE_SELECT = {
  id: true,
  cardId: true,
  english: true,
  vietnamese: true,
  reviewWords: true,
  order: true,
} as const;

/**
 * GET /api/practice-sentences?deckId=...  → các thẻ của deck kèm bộ câu.
 * GET /api/practice-sentences?cardId=...  → đúng 1 thẻ kèm bộ câu (dùng cho
 * hộp thoại chi tiết từ).
 * Deck đang khoá thì trả rỗng, giống các API thẻ khác.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get("cardId")?.trim();

    if (cardId) {
      const card = await prisma.card.findFirst({
        where: { id: cardId, deletedAt: null },
        include: { practiceSentences: { orderBy: { order: "asc" }, select: SENTENCE_SELECT } },
      });
      if (!card) return fail("Không tìm thấy thẻ", 404);
      const locked = await getLockedDeckIds();
      if (locked.includes(card.deckId)) return ok([]);
      return ok([card]);
    }

    const deckId = searchParams.get("deckId")?.trim();
    if (!deckId) return fail("Thiếu deckId hoặc cardId", 400);

    const lockedDeckIds = await getLockedDeckIds();
    if (lockedDeckIds.includes(deckId)) return ok([]);

    const cards = await prisma.card.findMany({
      where: { deckId, deletedAt: null },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: { practiceSentences: { orderBy: { order: "asc" }, select: SENTENCE_SELECT } },
    });
    return ok(cards);
  } catch (error) {
    return handleError(error);
  }
}
