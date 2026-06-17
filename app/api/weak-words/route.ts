import { prisma } from "@/lib/db";
import { handleError, ok } from "@/lib/api-helpers";

const MAX_RESULTS = 30;

/**
 * "Từ hay sai" — tổng hợp từ ReviewLog: đếm số lần đánh giá "Lại" (rating = 1)
 * trên tổng số lần ôn của mỗi thẻ. Trả về các thẻ sai nhiều, kèm tên deck.
 */
export async function GET() {
  try {
    const [totals, wrongs] = await Promise.all([
      prisma.reviewLog.groupBy({ by: ["cardId"], _count: { _all: true } }),
      prisma.reviewLog.groupBy({
        by: ["cardId"],
        where: { rating: 1 },
        _count: { _all: true },
      }),
    ]);

    const wrongMap = new Map(wrongs.map((w) => [w.cardId, w._count._all]));

    const ranked = totals
      .map((t) => {
        const wrong = wrongMap.get(t.cardId) ?? 0;
        return { cardId: t.cardId, total: t._count._all, wrong };
      })
      .filter((s) => s.wrong > 0)
      // Ưu tiên sai nhiều lần; hoà thì xét tỉ lệ sai
      .sort((a, b) => b.wrong - a.wrong || b.wrong / b.total - a.wrong / a.total)
      .slice(0, MAX_RESULTS);

    if (ranked.length === 0) return ok([]);

    const cards = await prisma.card.findMany({
      where: { id: { in: ranked.map((s) => s.cardId) }, deletedAt: null },
      include: { deck: { select: { name: true } } },
    });
    const byId = new Map(cards.map((c) => [c.id, c]));

    const result = ranked.flatMap((s) => {
      const c = byId.get(s.cardId);
      if (!c) return [];
      return [
        {
          id: c.id,
          word: c.word,
          meaning: c.meaning,
          deckId: c.deckId,
          deckName: c.deck.name,
          wrong: s.wrong,
          total: s.total,
          errorRate: Math.round((s.wrong / s.total) * 100),
        },
      ];
    });

    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
