import { prisma } from "@/lib/db";
import { handleError, ok } from "@/lib/api-helpers";
import { getLockedDeckIds } from "@/lib/deck-progress";

/**
 * Tổng hợp TẤT CẢ từ trong mọi deck — kèm thông tin deck để hiển thị nguồn.
 * Bỏ qua các từ đã nằm trong thùng rác (deletedAt != null) và các từ thuộc
 * Unit ĐANG KHÓA (chưa mở khóa thì không xem trước nội dung).
 * Sắp xếp theo tên deck (số tự nhiên: Unit 1, 2, ... 10, ... 20) rồi tới thứ tự
 * thẻ trong deck. Prisma orderBy chỉ so sánh chuỗi nên ta sắp tên deck bằng JS
 * (localeCompare numeric) sau khi truy vấn — Array.sort ổn định nên vẫn giữ
 * đúng thứ tự thẻ (order, createdAt) bên trong mỗi deck.
 */
export async function GET() {
  try {
    const lockedDeckIds = await getLockedDeckIds();
    const cards = await prisma.card.findMany({
      where: { deletedAt: null, deckId: { notIn: lockedDeckIds } },
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
