import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api-helpers";
import { computeDeckLockStatus } from "@/lib/deck-progress";
import { deckUpdateSchema } from "@/lib/schemas";

interface RouteParams {
  params: Promise<{ deckId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { deckId } = await params;
    const deck = await prisma.deck.findFirst({
      where: { id: deckId, deletedAt: null },
      include: { _count: { select: { cards: { where: { deletedAt: null } }, stories: true } } },
    });
    if (!deck) return fail("Không tìm thấy deck", 404);
    // Tính trạng thái khóa/mở dựa trên toàn bộ chuỗi Unit.
    const allDecks = await prisma.deck.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, learnedAt: true },
    });
    const status = computeDeckLockStatus(allDecks).get(deckId) ?? {
      learned: deck.learnedAt != null,
      locked: false,
    };
    return ok({ ...deck, learned: status.learned, locked: status.locked });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { deckId } = await params;
    const body = await req.json();
    const data = deckUpdateSchema.parse(body);
    const deck = await prisma.deck.update({ where: { id: deckId }, data });
    return ok(deck);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { deckId } = await params;
    // Soft delete: chuyển deck vào thùng rác (các thẻ tự ẩn theo, không mất dữ liệu)
    await prisma.deck.update({
      where: { id: deckId },
      data: { deletedAt: new Date() },
    });
    return ok({ id: deckId });
  } catch (error) {
    return handleError(error);
  }
}
