import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api-helpers";
import { bulkCardsSchema } from "@/lib/schemas";
import { parseTags, stringifyTags } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ids, targetDeckId, tags } = bulkCardsSchema.parse(body);

    if (action === "delete") {
      // Soft delete: chuyển vào thùng rác
      const res = await prisma.card.updateMany({
        where: { id: { in: ids }, deletedAt: null },
        data: { deletedAt: new Date() },
      });
      return ok({ count: res.count, action });
    }

    if (action === "move") {
      if (!targetDeckId) return fail("Thiếu targetDeckId", 400);
      const deck = await prisma.deck.findUnique({ where: { id: targetDeckId } });
      if (!deck) return fail("Deck đích không tồn tại", 404);
      const res = await prisma.card.updateMany({
        where: { id: { in: ids } },
        data: { deckId: targetDeckId },
      });
      return ok({ count: res.count, action });
    }

    if (action === "suspend") {
      const res = await prisma.card.updateMany({
        where: { id: { in: ids } },
        data: { state: "SUSPENDED" },
      });
      return ok({ count: res.count, action });
    }

    if (action === "unsuspend") {
      const res = await prisma.card.updateMany({
        where: { id: { in: ids }, state: "SUSPENDED" },
        data: { state: "NEW", nextReviewDate: new Date() },
      });
      return ok({ count: res.count, action });
    }

    if (action === "tag") {
      if (!tags || tags.length === 0) return fail("Thiếu tags", 400);
      const cards = await prisma.card.findMany({
        where: { id: { in: ids }, deletedAt: null },
        select: { id: true, tags: true },
      });
      let count = 0;
      await prisma.$transaction(
        cards.map((c) => {
          const existing = parseTags(c.tags);
          const merged = Array.from(new Set([...existing, ...tags])).slice(0, 10);
          count++;
          return prisma.card.update({
            where: { id: c.id },
            data: { tags: stringifyTags(merged) },
          });
        }),
      );
      return ok({ count, action });
    }

    return fail("Hành động không hỗ trợ", 400);
  } catch (error) {
    return handleError(error);
  }
}
