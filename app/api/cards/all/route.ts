import { prisma } from "@/lib/db";
import { handleError, ok } from "@/lib/api-helpers";

/**
 * Tổng hợp TẤT CẢ từ trong mọi deck — kèm thông tin deck để hiển thị nguồn.
 * Bỏ qua các từ đã nằm trong thùng rác (deletedAt != null).
 * Sắp xếp theo tên deck rồi tới thứ tự thẻ trong deck.
 */
export async function GET() {
  try {
    const cards = await prisma.card.findMany({
      where: { deletedAt: null },
      orderBy: [{ deck: { name: "asc" } }, { order: "asc" }, { createdAt: "asc" }],
      include: {
        deck: { select: { id: true, name: true, color: true, icon: true } },
      },
    });
    return ok(cards);
  } catch (error) {
    return handleError(error);
  }
}
