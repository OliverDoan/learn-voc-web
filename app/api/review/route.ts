import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api-helpers";
import { reviewSchema } from "@/lib/schemas";
import { calculateNextReview } from "@/lib/srs";
import { addXp, recordStudyActivity, upsertDailyStat } from "@/lib/progress-service";
import { xpForReview } from "@/lib/xp";
import type { Rating } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cardId, rating, timeTakenMs } = reviewSchema.parse(body);

    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) return fail("Card không tồn tại", 404);

    const wasNew = card.state === "NEW";
    const previousInterval = card.interval;

    const result = calculateNextReview({
      rating: rating as Rating,
      easeFactor: card.easeFactor,
      interval: card.interval,
      repetitions: card.repetitions,
      lapses: card.lapses,
    });

    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: {
        easeFactor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
        nextReviewDate: result.nextReviewDate,
        state: result.newState,
        lapses: result.lapses,
      },
    });

    await prisma.reviewLog.create({
      data: {
        cardId,
        rating,
        timeTakenMs,
        previousInterval,
        newInterval: result.interval,
      },
    });

    const xpEarned = xpForReview(rating as Rating, wasNew);
    const now = new Date();

    await Promise.all([
      addXp(xpEarned),
      upsertDailyStat(now, {
        cardsReviewed: 1,
        cardsLearned: wasNew ? 1 : 0,
        correctCount: rating >= 3 ? 1 : 0,
        totalCount: 1,
        timeSpentSec: Math.round(timeTakenMs / 1000),
        xpEarned,
      }),
    ]);

    const progress = await recordStudyActivity(now);

    return ok({ card: updatedCard, xpEarned, srs: result, progress });
  } catch (error) {
    return handleError(error);
  }
}
