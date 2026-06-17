/**
 * Fallback miễn phí: lấy câu ví dụ cho các thẻ thiếu `example` từ
 * Free Dictionary API (api.dictionaryapi.dev). Chỉ nhận câu CHỨA ĐÚNG từ vựng
 * (để dùng cho bài "Điền từ vào câu"). Không có bản dịch.
 *
 * Từ nào API không có ví dụ phù hợp sẽ được bỏ qua (bù bằng Claude sau).
 *
 * Chạy: npx tsx scripts/generate-examples-dict.ts
 */
import { PrismaClient } from "@prisma/client";
import { lookupWord } from "../lib/dictionary";

const prisma = new PrismaClient();

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Tìm câu ví dụ chứa đúng từ; ưu tiên đúng loại từ.
function pickExample(
  meanings: { partOfSpeech: string; definitions: { example?: string }[] }[],
  word: string,
  preferredPos: string | null,
): string | null {
  const re = new RegExp(`\\b${escapeRegExp(word)}\\b`, "i");
  const pos = preferredPos?.split("/")[0]?.trim().toLowerCase();

  const candidates: string[] = [];
  const preferred: string[] = [];
  for (const m of meanings) {
    for (const d of m.definitions) {
      const ex = d.example?.trim();
      if (!ex || !re.test(ex)) continue;
      candidates.push(ex);
      if (pos && m.partOfSpeech.toLowerCase() === pos) preferred.push(ex);
    }
  }
  return preferred[0] ?? candidates[0] ?? null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const cards = await prisma.card.findMany({
    where: { OR: [{ example: null }, { example: "" }] },
    orderBy: [{ deckId: "asc" }, { order: "asc" }],
  });

  console.log(`🔎 ${cards.length} thẻ thiếu ví dụ — tra Free Dictionary...\n`);

  let found = 0;
  let notFound = 0;
  const missing: string[] = [];

  for (const card of cards) {
    const result = await lookupWord(card.word);
    const example = result ? pickExample(result.meanings, card.word, card.partOfSpeech) : null;

    if (example) {
      await prisma.card.update({ where: { id: card.id }, data: { example } });
      found++;
      console.log(`   ✓ ${card.word}`);
    } else {
      notFound++;
      missing.push(card.word);
    }
    await sleep(250); // tránh spam API
  }

  console.log(`\n✅ Có ví dụ: ${found} thẻ. Chưa có: ${notFound} thẻ.`);
  if (missing.length) {
    console.log(`\n⏳ Cần bù (Claude) cho ${missing.length} từ:\n   ${missing.join(", ")}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
