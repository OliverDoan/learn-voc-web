import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api-helpers";
import { isDeckUnlocked } from "@/lib/deck-progress";
import { allExercisesDone } from "@/lib/deck-activities";
import { countWordTokens } from "@/lib/story-parser";
import type { Card } from "@/lib/types";

interface RouteParams {
  params: Promise<{ deckId: string }>;
}

/** Đánh dấu deck đã học xong. Chỉ cho phép khi deck đang mở khóa (các Unit trước đã học). */
export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const { deckId } = await params;
    const deck = await prisma.deck.findFirst({ where: { id: deckId, deletedAt: null } });
    if (!deck) return fail("Không tìm thấy deck", 404);

    if (!(await isDeckUnlocked(deckId))) {
      return fail("Cần học xong các Unit trước để mở khóa deck này", 400);
    }

    // Bắt buộc làm hết các dạng bài tập khả dụng trước khi đánh dấu học xong.
    const [cards, activities, stories] = await Promise.all([
      prisma.card.findMany({ where: { deckId, deletedAt: null } }),
      prisma.deckActivity.findMany({
        where: { deckId },
        select: { activity: true, bestAccuracy: true },
      }),
      prisma.story.findMany({ where: { deckId }, select: { content: true } }),
    ]);
    const hasStoryWithWords = stories.some((s) => countWordTokens(s.content) > 0);
    if (!allExercisesDone(cards as unknown as Card[], activities, { hasStoryWithWords })) {
      return fail("Cần hoàn thành tất cả dạng bài tập của deck trước khi đánh dấu học xong", 400);
    }

    const updated = await prisma.deck.update({
      where: { id: deckId },
      data: { learnedAt: new Date() },
    });
    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}

/** Bỏ đánh dấu đã học xong (các deck sau sẽ tự khóa lại do khóa là suy diễn). */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { deckId } = await params;
    const deck = await prisma.deck.findFirst({ where: { id: deckId, deletedAt: null } });
    if (!deck) return fail("Không tìm thấy deck", 404);

    const updated = await prisma.deck.update({
      where: { id: deckId },
      data: { learnedAt: null },
    });
    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}
