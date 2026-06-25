/**
 * Thêm một deck mới + toàn bộ thẻ từ một file JSON.
 *
 * File JSON theo đúng định dạng `deckImportSchema` (xem public/deck-template.json):
 *   { "deck": { name, description?, color?, icon? }, "cards": [ { word, meaning, ... } ] }
 *
 * Dùng chung validation Zod với API `/api/decks/import` để dữ liệu luôn hợp lệ.
 * Chạy: pnpm add:deck <đường-dẫn-file.json>
 *   (hoặc: npx tsx --env-file=.env scripts/add-deck.ts <file.json>)
 *
 * Sau khi chạy xong, nhớ đồng bộ seed: pnpm data:export
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { deckImportSchema } from "../lib/schemas";
import { stringifyTags } from "../lib/utils";
import { stringifyWordForms, stringifyWordFormMeanings } from "../lib/word-forms";

const prisma = new PrismaClient();

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("❌ Thiếu đường dẫn file JSON.\n   Dùng: pnpm add:deck <file.json>");
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), arg);
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (e) {
    console.error(`❌ Không đọc/parse được file "${filePath}":`, e instanceof Error ? e.message : e);
    process.exit(1);
  }

  // Validate bằng đúng schema của API import
  const parsed = deckImportSchema.parse(raw);

  // Cảnh báo nếu đã có deck trùng tên (vẫn cho tạo, vì app cho phép)
  const dup = await prisma.deck.findFirst({ where: { name: parsed.deck.name } });
  if (dup) {
    console.warn(`⚠️  Đã tồn tại deck tên "${parsed.deck.name}" — sẽ tạo thêm một deck mới cùng tên.`);
  }

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
    wordFormMeanings: stringifyWordFormMeanings(c.wordFormMeanings),
    order: idx,
  }));

  const result = await prisma.card.createMany({ data });

  console.log(`✅ Đã tạo deck "${deck.name}" (id: ${deck.id}) với ${result.count} thẻ.`);
  console.log(`   Nhớ chạy: pnpm data:export  để đồng bộ prisma/seed-data.json`);
}

main()
  .catch((e) => {
    console.error("❌ Lỗi:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
