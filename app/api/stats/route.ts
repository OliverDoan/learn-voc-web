import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleError, ok } from "@/lib/api-helpers";

const DAY_MS = 1000 * 60 * 60 * 24;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const days = Math.min(366, Math.max(7, parseInt(url.searchParams.get("days") ?? "365", 10)));

    const end = startOfDay(new Date());
    const start = new Date(end.getTime() - (days - 1) * DAY_MS);

    const [daily, totalCards, stateGroups, topLapses] = await Promise.all([
      prisma.dailyStat.findMany({
        where: { date: { gte: start, lte: new Date(end.getTime() + DAY_MS - 1) } },
        orderBy: { date: "asc" },
      }),
      prisma.card.count({ where: { deletedAt: null, deck: { deletedAt: null } } }),
      prisma.card.groupBy({
        by: ["state"],
        where: { deletedAt: null, deck: { is: { deletedAt: null } } },
        _count: { _all: true },
      }),
      prisma.card.findMany({
        where: { lapses: { gt: 0 }, deletedAt: null, deck: { deletedAt: null } },
        orderBy: [{ lapses: "desc" }, { updatedAt: "desc" }],
        take: 10,
        select: { id: true, word: true, meaning: true, lapses: true, state: true, deckId: true },
      }),
    ]);

    const dailyMap = new Map<string, (typeof daily)[number]>();
    for (const d of daily) dailyMap.set(isoDate(d.date), d);

    const series: Array<{
      date: string;
      reviewed: number;
      learned: number;
      correct: number;
      total: number;
      xp: number;
    }> = [];
    for (let i = 0; i < days; i++) {
      const day = new Date(start.getTime() + i * DAY_MS);
      const iso = isoDate(day);
      const stat = dailyMap.get(iso);
      series.push({
        date: iso,
        reviewed: stat?.cardsReviewed ?? 0,
        learned: stat?.cardsLearned ?? 0,
        correct: stat?.correctCount ?? 0,
        total: stat?.totalCount ?? 0,
        xp: stat?.xpEarned ?? 0,
      });
    }

    const stateDistribution = stateGroups.map((g) => ({
      state: g.state,
      count: g._count._all,
    }));

    return ok({
      totalCards,
      series,
      stateDistribution,
      topLapses,
    });
  } catch (error) {
    return handleError(error);
  }
}
