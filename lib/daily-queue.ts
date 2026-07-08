import { prisma } from "./db";
import { DEFAULT_DAILY_GOAL, SINGLETON_PROGRESS_ID } from "./constants";

export interface QueueCard {
  id: string;
  deckId: string;
  word: string;
  meaning: string;
  partOfSpeech: string | null;
  rootWord: string | null;
  rootWordMeaning: string | null;
  phonetic: string | null;
  example: string | null;
  exampleTranslation: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  dialect: string | null;
  variantWord: string | null;
  easeFactor: number;
  interval: number;
  repetitions: number;
  state: string;
  lapses: number;
}

export interface QueueOptions {
  newCardLimit?: number;
  cardIds?: readonly string[];
  /** true = ôn trước hạn: lấy TOÀN BỘ thẻ của deck, bỏ qua lịch SRS. */
  ignoreSchedule?: boolean;
}

type CardRow = QueueCard;

function toQueueCard(c: CardRow): QueueCard {
  return {
    id: c.id,
    deckId: c.deckId,
    word: c.word,
    meaning: c.meaning,
    partOfSpeech: c.partOfSpeech,
    rootWord: c.rootWord,
    rootWordMeaning: c.rootWordMeaning,
    phonetic: c.phonetic,
    example: c.example,
    exampleTranslation: c.exampleTranslation,
    imageUrl: c.imageUrl,
    audioUrl: c.audioUrl,
    dialect: c.dialect,
    variantWord: c.variantWord,
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
      where: { deckId, id: { in: [...opts.cardIds] }, deletedAt: null },
    });
    const byId = new Map(cards.map((c) => [c.id, c] as const));
    return opts.cardIds.flatMap((id) => {
      const c = byId.get(id);
      return c ? [toQueueCard(c)] : [];
    });
  }

  // Ôn trước hạn: trả toàn bộ thẻ của deck, không lọc theo nextReviewDate.
  if (opts.ignoreSchedule) {
    const cards = await prisma.card.findMany({
      where: { deckId, deletedAt: null },
      orderBy: { createdAt: "asc" },
    });
    return cards.map(toQueueCard);
  }

  const now = new Date();
  const progress = await prisma.userProgress.findUnique({
    where: { id: SINGLETON_PROGRESS_ID },
  });
  const dailyGoal = opts.newCardLimit ?? progress?.dailyGoal ?? DEFAULT_DAILY_GOAL;

  const reviewCards = await prisma.card.findMany({
    where: {
      deckId,
      deletedAt: null,
      state: { not: "NEW" },
      nextReviewDate: { lte: now },
    },
    orderBy: [{ state: "asc" }, { nextReviewDate: "asc" }],
  });

  const remaining = Math.max(0, dailyGoal - reviewCards.length);
  const newCards = remaining > 0
    ? await prisma.card.findMany({
        where: { deckId, deletedAt: null, state: "NEW" },
        orderBy: { createdAt: "asc" },
        take: remaining,
      })
    : [];

  return [...reviewCards, ...newCards].map(toQueueCard);
}

/**
 * Hàng đợi ôn tập GỘP TẤT CẢ DECK: thẻ đến hạn (mọi deck) + bù thẻ NEW tới dailyGoal.
 */
export async function getGlobalReviewQueue(): Promise<QueueCard[]> {
  const now = new Date();
  const progress = await prisma.userProgress.findUnique({
    where: { id: SINGLETON_PROGRESS_ID },
  });
  const dailyGoal = progress?.dailyGoal ?? DEFAULT_DAILY_GOAL;

  // Ôn gộp chỉ lấy thẻ từ deck ĐÃ HỌC XONG (learnedAt != null).
  const learnedDeckFilter = { deletedAt: null, learnedAt: { not: null } } as const;

  const reviewCards = await prisma.card.findMany({
    where: {
      deletedAt: null,
      deck: learnedDeckFilter,
      state: { not: "NEW" },
      nextReviewDate: { lte: now },
    },
    orderBy: [{ state: "asc" }, { nextReviewDate: "asc" }],
  });

  const remaining = Math.max(0, dailyGoal - reviewCards.length);
  const newCards = remaining > 0
    ? await prisma.card.findMany({
        where: { deletedAt: null, deck: learnedDeckFilter, state: "NEW" },
        orderBy: { createdAt: "asc" },
        take: remaining,
      })
    : [];

  return [...reviewCards, ...newCards].map(toQueueCard);
}

/** Lấy đúng các thẻ theo danh sách id (cross-deck), giữ thứ tự truyền vào. */
export async function getCardsByIds(ids: readonly string[]): Promise<QueueCard[]> {
  if (ids.length === 0) return [];
  const cards = await prisma.card.findMany({
    where: { id: { in: [...ids] }, deletedAt: null, deck: { deletedAt: null } },
  });
  const byId = new Map(cards.map((c) => [c.id, c] as const));
  return ids.flatMap((id) => {
    const c = byId.get(id);
    return c ? [toQueueCard(c)] : [];
  });
}

export async function countDueCards(deckId: string): Promise<{ due: number; newCount: number }> {
  const now = new Date();
  const [due, newCount] = await Promise.all([
    prisma.card.count({
      where: { deckId, deletedAt: null, state: { not: "NEW" }, nextReviewDate: { lte: now } },
    }),
    prisma.card.count({ where: { deckId, deletedAt: null, state: "NEW" } }),
  ]);
  return { due, newCount };
}
