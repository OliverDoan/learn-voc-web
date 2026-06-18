/**
 * Rà soát toàn bộ thẻ, điền từ ĐỒNG NGHĨA / TRÁI NGHĨA bằng Free Dictionary API
 * (api.dictionaryapi.dev — miễn phí, không cần API key).
 *
 * Mặc định chỉ xử lý thẻ CHƯA có synonyms & antonyms. Truyền --all để điền lại tất cả.
 * Chạy: pnpm data:synonyms   (hoặc: npx tsx --env-file=.env scripts/fill-synonyms.ts)
 */
import { PrismaClient } from "@prisma/client";
import { lookupWord } from "../lib/dictionary";

const prisma = new PrismaClient();

const REGEN_ALL = process.argv.includes("--all");
// Nghỉ giữa các request cho lịch sự với API miễn phí
const DELAY_MS = 250;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isEmptyList(json: string | null): boolean {
  if (!json) return true;
  try {
    const parsed = JSON.parse(json);
    return !Array.isArray(parsed) || parsed.length === 0;
  } catch {
    return true;
  }
}

async function main() {
  const cards = await prisma.card.findMany({
    where: { deletedAt: null },
    orderBy: [{ deckId: "asc" }, { order: "asc" }],
    select: { id: true, word: true, synonyms: true, antonyms: true },
  });

  const targets = REGEN_ALL
    ? cards
    : cards.filter((c) => isEmptyList(c.synonyms) && isEmptyList(c.antonyms));

  console.log(
    `🔎 Tổng ${cards.length} thẻ — sẽ xử lý ${targets.length} thẻ` +
      (REGEN_ALL ? " (--all)" : " (chưa có đồng/trái nghĩa)"),
  );

  let withSyn = 0;
  let withAnt = 0;
  let none = 0;

  for (const card of targets) {
    const result = await lookupWord(card.word);
    await sleep(DELAY_MS);

    const synonyms = result?.synonyms ?? [];
    const antonyms = result?.antonyms ?? [];

    if (synonyms.length === 0 && antonyms.length === 0) {
      none++;
      console.log(`   • "${card.word}": không có dữ liệu`);
      continue;
    }

    await prisma.card.update({
      where: { id: card.id },
      data: {
        ...(synonyms.length > 0 ? { synonyms: JSON.stringify(synonyms) } : {}),
        ...(antonyms.length > 0 ? { antonyms: JSON.stringify(antonyms) } : {}),
      },
    });

    if (synonyms.length > 0) withSyn++;
    if (antonyms.length > 0) withAnt++;
    console.log(
      `   ✓ "${card.word}": ${synonyms.length} đồng nghĩa, ${antonyms.length} trái nghĩa`,
    );
  }

  console.log(
    `\n✅ Hoàn tất: ${withSyn} thẻ có đồng nghĩa, ${withAnt} thẻ có trái nghĩa, ${none} thẻ không tìm thấy.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
