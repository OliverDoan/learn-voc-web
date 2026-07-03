import { prisma } from "@/lib/db";
import { handleError, ok } from "@/lib/api-helpers";
import { parseWrongCardIds } from "@/lib/deck-activities";
import { aggregateWrongCards } from "@/lib/history";

// Số lượt gần nhất hiển thị trong timeline "Lịch sử làm bài".
const TIMELINE_LIMIT = 100;

const DECK_SELECT = { id: true, name: true, color: true, icon: true } as const;

/**
 * Dữ liệu cho trang "Lịch sử làm bài & Câu sai cần ôn":
 * - attempts: các lượt làm gần nhất (timeline)
 * - wrongCards: các thẻ từng làm sai, cộng dồn qua tất cả các lượt
 */
export async function GET() {
  try {
    // Timeline: các lượt gần nhất kèm tên deck.
    const attempts = await prisma.exerciseAttempt.findMany({
      orderBy: { createdAt: "desc" },
      take: TIMELINE_LIMIT,
      include: { deck: { select: DECK_SELECT } },
    });

    // Tổng hợp câu sai từ TẤT CẢ lượt có câu sai (cộng dồn).
    const wrongAttempts = await prisma.exerciseAttempt.findMany({
      where: { wrongCount: { gt: 0 } },
      select: { wrongCardIds: true, createdAt: true },
    });
    const agg = aggregateWrongCards(
      wrongAttempts.map((a) => ({
        wrongCardIds: parseWrongCardIds(a.wrongCardIds),
        createdAt: a.createdAt.toISOString(),
      })),
    );

    // Lấy dữ liệu thẻ còn tồn tại (bỏ thẻ đã xoá vào thùng rác).
    const ids = agg.map((w) => w.cardId);
    const cards = ids.length
      ? await prisma.card.findMany({
          where: { id: { in: ids }, deletedAt: null },
          select: {
            id: true,
            word: true,
            meaning: true,
            partOfSpeech: true,
            phonetic: true,
            deck: { select: DECK_SELECT },
          },
        })
      : [];
    const cardById = new Map(cards.map((c) => [c.id, c]));

    const wrongCards = agg
      .map((w) => {
        const card = cardById.get(w.cardId);
        if (!card) return null; // thẻ đã bị xoá
        return {
          id: card.id,
          word: card.word,
          meaning: card.meaning,
          partOfSpeech: card.partOfSpeech,
          phonetic: card.phonetic,
          deck: card.deck,
          wrongCount: w.wrongCount,
          lastWrongAt: w.lastWrongAt,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const timeline = attempts.map((a) => ({
      id: a.id,
      deck: a.deck,
      activity: a.activity,
      accuracy: a.accuracy,
      totalCount: a.totalCount,
      wrongCount: a.wrongCount,
      createdAt: a.createdAt.toISOString(),
    }));

    return ok({ attempts: timeline, wrongCards });
  } catch (error) {
    return handleError(error);
  }
}
