import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleError, ok } from "@/lib/api-helpers";
import { computeDeckLockStatus } from "@/lib/deck-progress";
import { deckCreateSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const decks = await prisma.deck.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { cards: { where: { deletedAt: null } }, stories: true } },
      },
    });
    const now = new Date();
    const lockStatus = computeDeckLockStatus(decks);
    const enriched = await Promise.all(
      decks.map(async (d) => {
        const [due, newCount] = await Promise.all([
          prisma.card.count({
            where: {
              deckId: d.id,
              deletedAt: null,
              state: { not: "NEW" },
              nextReviewDate: { lte: now },
            },
          }),
          prisma.card.count({ where: { deckId: d.id, deletedAt: null, state: "NEW" } }),
        ]);
        const status = lockStatus.get(d.id) ?? { learned: d.learnedAt != null, locked: false };
        return { ...d, due, newCount, learned: status.learned, locked: status.locked };
      }),
    );
    return ok(enriched);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = deckCreateSchema.parse(body);
    const deck = await prisma.deck.create({ data });
    return ok(deck, undefined, 201);
  } catch (error) {
    return handleError(error);
  }
}
