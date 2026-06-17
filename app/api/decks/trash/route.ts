import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleError, ok } from "@/lib/api-helpers";
import { trashActionSchema } from "@/lib/schemas";

// Danh sách deck đã xoá (trong thùng rác), kèm số từ sẽ được khôi phục.
export async function GET() {
  try {
    const decks = await prisma.deck.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      include: { _count: { select: { cards: { where: { deletedAt: null } }, stories: true } } },
    });
    return ok(decks);
  } catch (error) {
    return handleError(error);
  }
}

// Khôi phục (restore) hoặc xoá vĩnh viễn (purge) các deck trong thùng rác.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ids } = trashActionSchema.parse(body);

    if (action === "restore") {
      const res = await prisma.deck.updateMany({
        where: { id: { in: ids }, deletedAt: { not: null } },
        data: { deletedAt: null },
      });
      return ok({ count: res.count, action });
    }

    // purge: xoá vĩnh viễn deck (cascade xoá toàn bộ card + story) — chỉ deck đang ở thùng rác
    const res = await prisma.deck.deleteMany({
      where: { id: { in: ids }, deletedAt: { not: null } },
    });
    return ok({ count: res.count, action });
  } catch (error) {
    return handleError(error);
  }
}
