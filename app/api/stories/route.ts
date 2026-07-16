import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api-helpers";
import { storyCreateSchema } from "@/lib/schemas";
import { extractWords } from "@/lib/story-parser";

export async function GET(req: NextRequest) {
  try {
    const deckId = new URL(req.url).searchParams.get("deckId");
    const where = deckId ? { deckId } : {};

    // KHÔNG select `imageUrl` (ảnh base64 ~700KB/truyện): nếu nhồi cả ảnh vào danh
    // sách, payload phình lên hàng chục MB khiến API rất chậm. Ảnh phục vụ riêng qua
    // GET /api/stories/[id]/image (lazy + cache được).
    const stories = await prisma.story.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        deckId: true,
        title: true,
        content: true,
        contentEn: true,
        audioUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { storyCards: true } },
        deck: { select: { id: true, name: true } },
      },
    });

    // Truyện nào có ảnh (query nhẹ, chỉ lấy id — không tải base64 về server).
    const imaged = await prisma.story.findMany({
      where: { ...where, NOT: { imageUrl: null } },
      select: { id: true },
    });
    const hasImage = new Set(imaged.map((s) => s.id));

    // `imageUrl` trả về là ĐƯỜNG DẪN endpoint (kèm ?v=updatedAt để cache-bust khi đổi ảnh).
    const result = stories.map((s) => ({
      ...s,
      imageUrl: hasImage.has(s.id)
        ? `/api/stories/${s.id}/image?v=${s.updatedAt.getTime()}`
        : null,
    }));

    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deckId, title, content, contentEn, imageUrl, audioUrl } =
      storyCreateSchema.parse(body);

    const deck = await prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) return fail("Deck không tồn tại", 404);

    const tokens = extractWords(content);
    const wordSet = Array.from(new Set(tokens.map((t) => t.word.toLowerCase())));

    const existingCards = await prisma.card.findMany({
      where: { deckId, word: { in: wordSet }, deletedAt: null },
    });
    const wordToCard = new Map<string, string>();
    for (const c of existingCards) wordToCard.set(c.word.toLowerCase(), c.id);

    const story = await prisma.story.create({
      data: {
        deckId,
        title,
        content,
        contentEn: contentEn || null,
        imageUrl: imageUrl || null,
        audioUrl: audioUrl || null,
        storyCards: {
          create: tokens
            .map((t, idx) => {
              const cardId = wordToCard.get(t.word.toLowerCase());
              if (!cardId) return null;
              return { cardId, order: idx };
            })
            .filter(
              (x): x is { cardId: string; order: number } => x !== null,
            )
            .filter(
              (x, idx, arr) => arr.findIndex((y) => y.cardId === x.cardId) === idx,
            ),
        },
      },
    });

    return ok(story, undefined, 201);
  } catch (error) {
    return handleError(error);
  }
}
