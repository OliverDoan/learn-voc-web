import { prisma } from "@/lib/db";
import { handleError, ok } from "@/lib/api-helpers";

/**
 * Danh sách từ yêu thích across tất cả deck — kèm thông tin deck để hiển thị nguồn.
 * Bỏ qua các từ đã nằm trong thùng rác (deletedAt != null).
 */
export async function GET() {
  try {
    const cards = await prisma.card.findMany({
      where: { favorite: true, deletedAt: null },
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
