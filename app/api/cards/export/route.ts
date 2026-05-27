import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fail, handleError } from "@/lib/api-helpers";
import { safeFilename, toCsv, toJson } from "@/lib/export-cards";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deckId = searchParams.get("deckId");
    const format = (searchParams.get("format") ?? "json").toLowerCase();

    if (!deckId) return fail("Thiếu deckId", 400);
    if (format !== "csv" && format !== "json") {
      return fail('Format phải là "csv" hoặc "json"', 400);
    }

    const deck = await prisma.deck.findUnique({ where: { id: deckId } });
    if (!deck) return fail("Deck không tồn tại", 404);

    const cards = await prisma.card.findMany({
      where: { deckId },
      orderBy: { createdAt: "asc" },
      select: {
        word: true,
        meaning: true,
        partOfSpeech: true,
        phonetic: true,
        example: true,
        exampleTranslation: true,
        note: true,
        tags: true,
      },
    });

    const baseName = safeFilename(deck.name);

    if (format === "csv") {
      const body = toCsv(cards);
      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${baseName}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const body = JSON.stringify(toJson(deck, cards), null, 2);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${baseName}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
