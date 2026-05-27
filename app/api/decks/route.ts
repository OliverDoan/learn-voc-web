import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleError, ok } from "@/lib/api-helpers";
import { deckCreateSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const decks = await prisma.deck.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { cards: true, stories: true } },
      },
    });
    const now = new Date();
    const enriched = await Promise.all(
      decks.map(async (d) => {
        const [due, newCount] = await Promise.all([
          prisma.card.count({
            where: { deckId: d.id, state: { not: "NEW" }, nextReviewDate: { lte: now } },
          }),
          prisma.card.count({ where: { deckId: d.id, state: "NEW" } }),
        ]);
        return { ...d, due, newCount };
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
