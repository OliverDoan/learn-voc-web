import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fail, handleError } from "@/lib/api-helpers";
import { abbreviatePos, buildPrintWorkbook, type PrintDeck } from "@/lib/export-print";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/**
 * Xuất file Excel 1 sheet để in: mỗi cột = 1 deck, mỗi ô = 1 từ.
 * Query `deckIds` (danh sách id ngăn cách dấu phẩy) — bỏ trống = xuất tất cả deck.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("deckIds");
    const ids = idsParam
      ? idsParam.split(",").map((s) => s.trim()).filter(Boolean)
      : null;

    const decks = await prisma.deck.findMany({
      where: {
        deletedAt: null,
        ...(ids && ids.length > 0 ? { id: { in: ids } } : {}),
      },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    });

    if (decks.length === 0) return fail("Không có deck nào để xuất", 400);

    const printDecks: PrintDeck[] = await Promise.all(
      decks.map(async (deck) => {
        const cards = await prisma.card.findMany({
          where: { deckId: deck.id, deletedAt: null },
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          select: { word: true, partOfSpeech: true },
        });
        // Ghép từ loại viết tắt vào sau từ vựng: "abroad (adv)"
        const words = cards.map((c) => {
          const abbr = abbreviatePos(c.partOfSpeech);
          return abbr ? `${c.word} (${abbr})` : c.word;
        });
        return { name: deck.name, words };
      }),
    );

    const buffer = await buildPrintWorkbook(printDecks);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": XLSX_MIME,
        "Content-Disposition": `attachment; filename="tu-vung-de-in.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
