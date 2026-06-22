import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleError, ok } from "@/lib/api-helpers";
import { deckImportSchema } from "@/lib/schemas";
import { stringifyTags } from "@/lib/utils";
import { stringifyWordForms } from "@/lib/word-forms";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = deckImportSchema.parse(body);

    // Tạo deck mới rồi nạp toàn bộ card vào đó; giữ thứ tự theo file qua `order`.
    const deck = await prisma.deck.create({
      data: {
        name: parsed.deck.name,
        description: parsed.deck.description ?? null,
        color: parsed.deck.color,
        icon: parsed.deck.icon ?? null,
      },
    });

    const data = parsed.cards.map((c, idx) => ({
      deckId: deck.id,
      word: c.word,
      meaning: c.meaning,
      partOfSpeech: c.partOfSpeech ?? null,
      rootWord: c.rootWord ?? null,
      rootWordMeaning: c.rootWordMeaning ?? null,
      phonetic: c.phonetic ?? null,
      example: c.example ?? null,
      exampleTranslation: c.exampleTranslation ?? null,
      note: c.note ?? null,
      tags: stringifyTags(c.tags),
      wordForms: stringifyWordForms(c.wordForms),
      order: idx,
    }));

    const result = await prisma.card.createMany({ data });
    return ok(
      { deckId: deck.id, deckName: deck.name, count: result.count },
      undefined,
      201,
    );
  } catch (error) {
    return handleError(error);
  }
}
