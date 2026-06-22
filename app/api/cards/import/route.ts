import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { fail, handleError, ok } from "@/lib/api-helpers";
import { cardImportSchema } from "@/lib/schemas";
import { stringifyTags } from "@/lib/utils";
import { stringifyWordForms } from "@/lib/word-forms";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = cardImportSchema.parse(body);

    const deck = await prisma.deck.findUnique({ where: { id: parsed.deckId } });
    if (!deck) return fail("Deck không tồn tại", 404);

    const data = parsed.cards.map((c) => ({
      deckId: parsed.deckId,
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
    }));

    const result = await prisma.card.createMany({ data });
    return ok({ count: result.count }, undefined, 201);
  } catch (error) {
    return handleError(error);
  }
}
