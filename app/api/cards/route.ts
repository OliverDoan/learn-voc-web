import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api-helpers";
import { cardCreateSchema } from "@/lib/schemas";
import { stringifyTags } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deckId = searchParams.get("deckId");
    const stateFilter = searchParams.get("state");
    const search = searchParams.get("q")?.trim();

    const cards = await prisma.card.findMany({
      where: {
        ...(deckId ? { deckId } : {}),
        ...(stateFilter ? { state: stateFilter } : {}),
        ...(search
          ? {
              OR: [
                { word: { contains: search } },
                { meaning: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return ok(cards);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = cardCreateSchema.parse(body);

    const deck = await prisma.deck.findUnique({ where: { id: parsed.deckId } });
    if (!deck) return fail("Deck không tồn tại", 404);

    const { tags, imageUrl, audioUrl, ...rest } = parsed;
    const card = await prisma.card.create({
      data: {
        ...rest,
        imageUrl: imageUrl || null,
        audioUrl: audioUrl || null,
        tags: stringifyTags(tags),
      },
    });
    return ok(card, undefined, 201);
  } catch (error) {
    return handleError(error);
  }
}
