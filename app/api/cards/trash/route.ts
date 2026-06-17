import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleError, ok } from "@/lib/api-helpers";
import { trashActionSchema } from "@/lib/schemas";

// Danh sách thẻ đã xoá (trong thùng rác), kèm tên deck.
export async function GET() {
  try {
    const cards = await prisma.card.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      include: { deck: { select: { id: true, name: true, color: true, icon: true } } },
    });
    return ok(cards);
  } catch (error) {
    return handleError(error);
  }
}

// Khôi phục (restore) hoặc xoá vĩnh viễn (purge) các thẻ trong thùng rác.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ids } = trashActionSchema.parse(body);

    if (action === "restore") {
      const res = await prisma.card.updateMany({
        where: { id: { in: ids }, deletedAt: { not: null } },
        data: { deletedAt: null },
      });
      return ok({ count: res.count, action });
    }

    // purge: xoá vĩnh viễn — chỉ xoá thẻ đang ở trong thùng rác
    const res = await prisma.card.deleteMany({
      where: { id: { in: ids }, deletedAt: { not: null } },
    });
    return ok({ count: res.count, action });
  } catch (error) {
    return handleError(error);
  }
}
