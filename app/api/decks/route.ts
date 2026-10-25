import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { CHINESE_DECK_LANGUAGE, parseDeckLanguage } from "@/lib/chinese";
import { handleError, ok } from "@/lib/api-helpers";
import {
  computeDeckLockStatus,
  isUnlockAllDecksEnabled,
} from "@/lib/deck-progress";
import { allExercisesDone } from "@/lib/deck-activities";
import { countWordTokens } from "@/lib/story-parser";
import { deckCreateSchema } from "@/lib/schemas";
import type { Card } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    // ?language=zh → deck tiếng Trung; mặc định "en" để module tiếng Trung không lẫn vào.
    const language = parseDeckLanguage(
      new URL(req.url).searchParams.get("language"),
    );
    const decks = await prisma.deck.findMany({
      where: { deletedAt: null, language },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { cards: { where: { deletedAt: null } }, stories: true },
        },
      },
    });
    const now = new Date();
    const unlockAll = await isUnlockAllDecksEnabled();
    // Deck tiếng Trung nằm ngoài chuỗi khóa tuần tự kiểu Duolingo → luôn mở.
    const lockStatus = computeDeckLockStatus(decks, {
      unlockAll: unlockAll || language === CHINESE_DECK_LANGUAGE,
    });
    const deckIds = decks.map((d) => d.id);

    // Nạp gộp 1 lần (tránh N+1) để tính "đã đủ bài tập để mở khóa" cho mọi deck.
    const [allCards, allActivities, allStories] = await Promise.all([
      prisma.card.findMany({
        where: { deletedAt: null, deckId: { in: deckIds } },
      }),
      prisma.deckActivity.findMany({
        where: { deckId: { in: deckIds } },
        select: {
          deckId: true,
          activity: true,
          bestAccuracy: true,
          wrongCardIds: true,
        },
      }),
      prisma.story.findMany({
        where: { deckId: { in: deckIds } },
        select: { deckId: true, content: true },
      }),
    ]);

    const cardsByDeck = new Map<string, Card[]>();
    for (const c of allCards) {
      const list = cardsByDeck.get(c.deckId) ?? [];
      list.push(c as unknown as Card);
      cardsByDeck.set(c.deckId, list);
    }
    const activitiesByDeck = new Map<
      string,
      {
        activity: string;
        bestAccuracy: number | null;
        wrongCardIds: string | null;
      }[]
    >();
    for (const a of allActivities) {
      const list = activitiesByDeck.get(a.deckId) ?? [];
      list.push(a);
      activitiesByDeck.set(a.deckId, list);
    }
    const hasStoryWordsByDeck = new Map<string, boolean>();
    for (const s of allStories) {
      if (countWordTokens(s.content) > 0)
        hasStoryWordsByDeck.set(s.deckId, true);
    }
    // Deck nào đã có câu luyện viết (mở dạng "Luyện viết câu").
    const practiceRows = await prisma.practiceSentence.findMany({
      where: { card: { deletedAt: null, deckId: { in: deckIds } } },
      select: { card: { select: { deckId: true } } },
      distinct: ["cardId"],
    });
    const hasPracticeByDeck = new Set(practiceRows.map((r) => r.card.deckId));

    // Đếm thẻ đến hạn / thẻ mới bằng 2 truy vấn gộp thay vì 2 truy vấn MỖI deck
    // (40 deck = 80 truy vấn song song, đủ để cạn connection pool của Prisma).
    const [dueRows, newRows] = await Promise.all([
      prisma.card.groupBy({
        by: ["deckId"],
        where: {
          deckId: { in: deckIds },
          deletedAt: null,
          state: { not: "NEW" },
          nextReviewDate: { lte: now },
        },
        _count: { _all: true },
      }),
      prisma.card.groupBy({
        by: ["deckId"],
        where: { deckId: { in: deckIds }, deletedAt: null, state: "NEW" },
        _count: { _all: true },
      }),
    ]);
    const dueByDeck = new Map(dueRows.map((r) => [r.deckId, r._count._all]));
    const newByDeck = new Map(newRows.map((r) => [r.deckId, r._count._all]));

    const enriched = decks.map((d) => {
      const due = dueByDeck.get(d.id) ?? 0;
      const newCount = newByDeck.get(d.id) ?? 0;
      const status = lockStatus.get(d.id) ?? {
        learned: d.learnedAt != null,
        locked: false,
      };
      const exercisesDone = allExercisesDone(
        cardsByDeck.get(d.id) ?? [],
        activitiesByDeck.get(d.id) ?? [],
        {
          hasStoryWithWords: hasStoryWordsByDeck.get(d.id) ?? false,
          hasPracticeSentences: hasPracticeByDeck.has(d.id),
        },
      );
      return {
        ...d,
        due,
        newCount,
        learned: status.learned,
        locked: status.locked,
        exercisesDone,
      };
    });
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
