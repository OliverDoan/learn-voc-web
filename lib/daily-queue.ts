import { prisma } from "./db";
import { DEFAULT_DAILY_GOAL, SINGLETON_PROGRESS_ID } from "./constants";

export interface QueueCard {
  id: string;
  deckId: string;
  word: string;
  meaning: string;
  partOfSpeech: string | null;
  phonetic: string | null;
  example: string | null;
  exampleTranslation: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  easeFactor: number;
  interval: number;
  repetitions: number;
  state: string;
  lapses: number;
}

export interface QueueOptions {
  newCardLimit?: number;
  cardIds?: readonly string[];
}

type CardRow = QueueCard;

function toQueueCard(c: CardRow): QueueCard {
  return {
    id: c.id,
    deckId: c.deckId,
    word: c.word,
    meaning: c.meaning,
    partOfSpeech: c.partOfSpeech,
    phonetic: c.phonetic,
    example: c.example,
    exampleTranslation: c.exampleTranslation,
    imageUrl: c.imageUrl,
    audioUrl: c.audioUrl,
    easeFactor: c.easeFactor,
    interval: c.interval,
    repetitions: c.repetitions,
    state: c.state,
    lapses: c.lapses,
  };
}

export async function getReviewQueue(
  deckId: string,
  options: number | QueueOptions = {},
): Promise<QueueCard[]> {
  const opts: QueueOptions =
    typeof options === "number" ? { newCardLimit: options } : options;

  if (opts.cardIds && opts.cardIds.length > 0) {
    const cards = await prisma.card.findMany({
      where: { deckId, id: { in: [...opts.cardIds] } },
    });
    const byId = new Map(cards.map((c) => [c.id, c] as const));
    return opts.cardIds.flatMap((id) => {
      const c = byId.get(id);
      return c ? [toQueueCard(c)] : [];
    });
  }

  const now = new Date();
  const progress = await prisma.userProgress.findUnique({
    where: { id: SINGLETON_PROGRESS_ID },
  });
  const dailyGoal = opts.newCardLimit ?? progress?.dailyGoal ?? DEFAULT_DAILY_GOAL;

  const reviewCards = await prisma.card.findMany({
    where: {
      deckId,
      state: { not: "NEW" },
      nextReviewDate: { lte: now },
    },
    orderBy: [{ state: "asc" }, { nextReviewDate: "asc" }],
  });

  const remaining = Math.max(0, dailyGoal - reviewCards.length);
  const newCards = remaining > 0
    ? await prisma.card.findMany({
        where: { deckId, state: "NEW" },
        orderBy: { createdAt: "asc" },
        take: remaining,
      })
    : [];

  return [...reviewCards, ...newCards].map(toQueueCard);
}

export async function countDueCards(deckId: string): Promise<{ due: number; newCount: number }> {
  const now = new Date();
  const [due, newCount] = await Promise.all([
    prisma.card.count({
      where: { deckId, state: { not: "NEW" }, nextReviewDate: { lte: now } },
    }),
    prisma.card.count({ where: { deckId, state: "NEW" } }),
  ]);
  return { due, newCount };
}
