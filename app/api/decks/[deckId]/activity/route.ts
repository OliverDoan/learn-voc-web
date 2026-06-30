import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api-helpers";
import { deckActivitySchema } from "@/lib/schemas";

interface RouteParams {
  params: Promise<{ deckId: string }>;
}

/**
 * Ghi nhận hoàn thành một dạng bài tập của deck.
 * Lưu best-accuracy (lấy max qua các lần làm) cho dạng có chấm điểm.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { deckId } = await params;
    const deck = await prisma.deck.findFirst({ where: { id: deckId, deletedAt: null } });
    if (!deck) return fail("Không tìm thấy deck", 404);

    const { activity, accuracy, wrongCardIds } = deckActivitySchema.parse(await req.json());

    const existing = await prisma.deckActivity.findUnique({
      where: { deckId_activity: { deckId, activity } },
    });

    // Giữ accuracy cao nhất qua các lần làm.
    const nextAccuracy =
      accuracy == null
        ? (existing?.bestAccuracy ?? null)
        : Math.max(accuracy, existing?.bestAccuracy ?? 0);

    // Danh sách câu sai luôn phản ánh LẦN GẦN NHẤT: gửi mảng (kể cả rỗng) => ghi đè;
    // không gửi (undefined) => giữ nguyên giá trị cũ.
    const nextWrongCardIds =
      wrongCardIds === undefined
        ? (existing?.wrongCardIds ?? "[]")
        : JSON.stringify(wrongCardIds);

    const record = await prisma.deckActivity.upsert({
      where: { deckId_activity: { deckId, activity } },
      update: { bestAccuracy: nextAccuracy, wrongCardIds: nextWrongCardIds, completedAt: new Date() },
      create: { deckId, activity, bestAccuracy: nextAccuracy, wrongCardIds: nextWrongCardIds },
    });

    return ok({ activity: record.activity, bestAccuracy: record.bestAccuracy });
  } catch (error) {
    return handleError(error);
  }
}
