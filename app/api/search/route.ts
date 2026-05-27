import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleError, ok } from "@/lib/api-helpers";

const LIMIT_PER_GROUP = 6;

export interface SearchResults {
  decks: Array<{ id: string; name: string; icon: string | null; color: string }>;
  cards: Array<{
    id: string;
    word: string;
    meaning: string;
    deckId: string;
    deckName: string;
  }>;
  stories: Array<{ id: string; title: string; deckId: string; deckName: string }>;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";

    if (q.length < 1) {
      const empty: SearchResults = { decks: [], cards: [], stories: [] };
      return ok(empty);
    }

    const [decks, cards, stories] = await Promise.all([
      prisma.deck.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
          ],
        },
        select: { id: true, name: true, icon: true, color: true },
        take: LIMIT_PER_GROUP,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.card.findMany({
        where: {
          OR: [
            { word: { contains: q } },
            { meaning: { contains: q } },
          ],
        },
        select: {
          id: true,
          word: true,
          meaning: true,
          deckId: true,
          deck: { select: { name: true } },
        },
        take: LIMIT_PER_GROUP,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.story.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { content: { contains: q } },
          ],
        },
        select: {
          id: true,
          title: true,
          deckId: true,
          deck: { select: { name: true } },
        },
        take: LIMIT_PER_GROUP,
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    const results: SearchResults = {
      decks,
      cards: cards.map((c) => ({
        id: c.id,
        word: c.word,
        meaning: c.meaning,
        deckId: c.deckId,
        deckName: c.deck.name,
      })),
      stories: stories.map((s) => ({
        id: s.id,
        title: s.title,
        deckId: s.deckId,
        deckName: s.deck.name,
      })),
    };
    return ok(results);
  } catch (error) {
    return handleError(error);
  }
}
