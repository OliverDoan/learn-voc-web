import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api-helpers";
import { storyUpdateSchema } from "@/lib/schemas";
import { extractWords } from "@/lib/story-parser";

interface RouteParams {
  params: Promise<{ storyId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { storyId } = await params;
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        storyCards: { include: { card: true }, orderBy: { order: "asc" } },
        deck: true,
      },
    });
    if (!story) return fail("Không tìm thấy truyện", 404);
    return ok(story);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { storyId } = await params;
    const body = await req.json();
    const data = storyUpdateSchema.parse(body);

    const existing = await prisma.story.findUnique({ where: { id: storyId } });
    if (!existing) return fail("Không tìm thấy truyện", 404);

    const updated = await prisma.story.update({
      where: { id: storyId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.contentEn !== undefined ? { contentEn: data.contentEn || null } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl || null } : {}),
        ...(data.audioUrl !== undefined ? { audioUrl: data.audioUrl || null } : {}),
      },
    });

    if (data.content !== undefined) {
      const tokens = extractWords(data.content);
      const wordSet = Array.from(new Set(tokens.map((t) => t.word.toLowerCase())));
      const cards = await prisma.card.findMany({
        where: { deckId: existing.deckId, word: { in: wordSet }, deletedAt: null },
      });
      const wordToCard = new Map<string, string>();
      for (const c of cards) wordToCard.set(c.word.toLowerCase(), c.id);

      await prisma.storyCard.deleteMany({ where: { storyId } });
      const newLinks = tokens
        .map((t, idx) => {
          const cardId = wordToCard.get(t.word.toLowerCase());
          if (!cardId) return null;
          return { storyId, cardId, order: idx };
        })
        .filter((x): x is { storyId: string; cardId: string; order: number } => x !== null)
        .filter((x, idx, arr) => arr.findIndex((y) => y.cardId === x.cardId) === idx);
      if (newLinks.length > 0) {
        await prisma.storyCard.createMany({ data: newLinks });
      }
    }

    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { storyId } = await params;
    await prisma.story.delete({ where: { id: storyId } });
    return ok({ id: storyId });
  } catch (error) {
    return handleError(error);
  }
}
