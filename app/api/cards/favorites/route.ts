import { prisma } from "@/lib/db";
import { handleError, ok } from "@/lib/api-helpers";
import { getLockedDeckIds } from "@/lib/deck-progress";

/**
 * Danh sách từ yêu thích across tất cả deck — kèm thông tin deck để hiển thị nguồn.
 * Bỏ qua các từ đã nằm trong thùng rác (deletedAt != null) và các từ thuộc Unit ĐANG KHÓA.
 */
export async function GET() {
  try {
    const lockedDeckIds = await getLockedDeckIds();
    const cards = await prisma.card.findMany({
      where: { favorite: true, deletedAt: null, deckId: { notIn: lockedDeckIds } },
      orderBy: { updatedAt: "desc" },
      include: {
        deck: { select: { id: true, name: true, color: true, icon: true } },
      },
    });
    return ok(cards);
  } catch (error) {
    return handleError(error);
  }
}
