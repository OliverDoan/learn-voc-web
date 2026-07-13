import { prisma } from "@/lib/db";
import { handleError, ok } from "@/lib/api-helpers";

/**
 * Tổng hợp TẤT CẢ từ trong mọi deck — kèm thông tin deck để hiển thị nguồn.
 * Bỏ qua các từ đã nằm trong thùng rác (deletedAt != null).
 * Sắp xếp theo tên deck (số tự nhiên: Unit 1, 2, ... 10, ... 20) rồi tới thứ tự
 * thẻ trong deck. Prisma orderBy chỉ so sánh chuỗi nên ta sắp tên deck bằng JS
 * (localeCompare numeric) sau khi truy vấn — Array.sort ổn định nên vẫn giữ
 * đúng thứ tự thẻ (order, createdAt) bên trong mỗi deck.
 */
export async function GET() {
  try {
    const cards = await prisma.card.findMany({
      where: { deletedAt: null },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: {
        deck: { select: { id: true, name: true, color: true, icon: true } },
      },
    });
    const sorted = [...cards].sort((a, b) =>
      a.deck.name.localeCompare(b.deck.name, undefined, { numeric: true }),
    );
    return ok(sorted);
  } catch (error) {
    return handleError(error);
  }
}
