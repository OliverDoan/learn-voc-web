import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api-helpers";
import { cardUpdateSchema } from "@/lib/schemas";
import { stringifyTags } from "@/lib/utils";
import { stringifyWordForms } from "@/lib/word-forms";

interface RouteParams {
  params: Promise<{ cardId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId } = await params;
    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) return fail("Không tìm thấy card", 404);
    return ok(card);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId } = await params;
    const body = await req.json();
    const parsed = cardUpdateSchema.parse(body);
    const { tags, imageUrl, audioUrl, wordForms, ...rest } = parsed;
    const card = await prisma.card.update({
      where: { id: cardId },
      data: {
        ...rest,
        ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
        ...(audioUrl !== undefined ? { audioUrl: audioUrl || null } : {}),
        ...(tags ? { tags: stringifyTags(tags) } : {}),
        ...(wordForms !== undefined ? { wordForms: stringifyWordForms(wordForms) } : {}),
      },
    });
    return ok(card);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId } = await params;
    await prisma.card.delete({ where: { id: cardId } });
    return ok({ id: cardId });
  } catch (error) {
    return handleError(error);
  }
}
