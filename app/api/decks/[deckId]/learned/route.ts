import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api-helpers";
import { isDeckUnlocked } from "@/lib/deck-progress";

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
