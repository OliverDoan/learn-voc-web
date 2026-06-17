import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api-helpers";
import { cardReorderSchema } from "@/lib/schemas";

/**
 * Sắp xếp lại thứ tự thẻ trong 1 deck: order = vị trí trong orderedIds.
 * Kiểm tra tất cả id thuộc đúng deck trước khi cập nhật (toàn vẹn dữ liệu).
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { deckId, orderedIds } = cardReorderSchema.parse(body);

    const owned = await prisma.card.count({
      where: { id: { in: orderedIds }, deckId, deletedAt: null },
    });
    if (owned !== orderedIds.length) {
      return fail("Danh sách thẻ không khớp deck", 400);
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.card.update({ where: { id }, data: { order: index } }),
      ),
    );

    return ok({ count: orderedIds.length });
  } catch (error) {
    return handleError(error);
  }
}
