import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api-helpers";
import { deckUpdateSchema } from "@/lib/schemas";

interface RouteParams {
  params: Promise<{ deckId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { deckId } = await params;
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      include: { _count: { select: { cards: true, stories: true } } },
    });
    if (!deck) return fail("Không tìm thấy deck", 404);
    return ok(deck);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { deckId } = await params;
    const body = await req.json();
    const data = deckUpdateSchema.parse(body);
    const deck = await prisma.deck.update({ where: { id: deckId }, data });
    return ok(deck);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { deckId } = await params;
    await prisma.deck.delete({ where: { id: deckId } });
    return ok({ id: deckId });
  } catch (error) {
    return handleError(error);
  }
}
