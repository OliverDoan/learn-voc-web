import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleError, ok } from "@/lib/api-helpers";
import { computeDeckLockStatus } from "@/lib/deck-progress";
import { allExercisesDone } from "@/lib/deck-activities";
import { countWordTokens } from "@/lib/story-parser";
import { deckCreateSchema } from "@/lib/schemas";
import type { Card } from "@/lib/types";

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

    // Nạp gộp 1 lần (tránh N+1) để tính "đã đủ bài tập để mở khóa" cho mọi deck.
    const [allCards, allActivities, allStories] = await Promise.all([
      prisma.card.findMany({ where: { deletedAt: null } }),
      prisma.deckActivity.findMany({
        select: { deckId: true, activity: true, bestAccuracy: true, wrongCardIds: true },
      }),
      prisma.story.findMany({ select: { deckId: true, content: true } }),
    ]);

    const cardsByDeck = new Map<string, Card[]>();
    for (const c of allCards) {
      const list = cardsByDeck.get(c.deckId) ?? [];
      list.push(c as unknown as Card);
      cardsByDeck.set(c.deckId, list);
    }
    const activitiesByDeck = new Map<
      string,
      { activity: string; bestAccuracy: number | null; wrongCardIds: string | null }[]
    >();
    for (const a of allActivities) {
      const list = activitiesByDeck.get(a.deckId) ?? [];
      list.push(a);
      activitiesByDeck.set(a.deckId, list);
    }
    const hasStoryWordsByDeck = new Map<string, boolean>();
    for (const s of allStories) {
      if (countWordTokens(s.content) > 0) hasStoryWordsByDeck.set(s.deckId, true);
    }

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
        const exercisesDone = allExercisesDone(
          cardsByDeck.get(d.id) ?? [],
          activitiesByDeck.get(d.id) ?? [],
          { hasStoryWithWords: hasStoryWordsByDeck.get(d.id) ?? false },
        );
        return {
          ...d,
          due,
          newCount,
          learned: status.learned,
          locked: status.locked,
          exercisesDone,
        };
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
