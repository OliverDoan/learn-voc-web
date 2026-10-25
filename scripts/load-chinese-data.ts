/**
 * Kiểm tra & nạp các deck tiếng Trung soạn tay từ `prisma/chinese-data/*.json`.
 *
 *   pnpm chinese:load --check   # chỉ validate, không ghi DB
 *   pnpm chinese:load           # validate rồi nạp (idempotent — chạy lại không nhân đôi)
 *
 * Deck được nhận diện theo cặp (name, language="zh"): đã có thì cập nhật thẻ theo
 * chữ Hán, chưa có thì tạo mới. File nào không đạt validate thì KHÔNG ghi gì.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import {
  parseChineseDeckFile,
  validateChineseDeckFile,
  type ChineseDeckFile,
} from "../lib/chinese-deck-file";

const prisma = new PrismaClient();
const DATA_DIR = path.resolve(process.cwd(), "prisma/chinese-data");
const LANGUAGE = "zh";

interface LoadedFile {
  fileName: string;
  data: ChineseDeckFile;
}

/** Đọc + validate toàn bộ file trong thư mục; trả về dữ liệu đã parse và lỗi (nếu có). */
function readAllFiles(): { files: LoadedFile[]; errors: string[] } {
  const fileNames = readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  const files: LoadedFile[] = [];
  const errors: string[] = [];

  for (const fileName of fileNames) {
    const fullPath = path.join(DATA_DIR, fileName);
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(fullPath, "utf8"));
    } catch (e) {
      errors.push(
        `${fileName}: không parse được JSON — ${e instanceof Error ? e.message : e}`,
      );
      continue;
    }

    const fileErrors = validateChineseDeckFile(raw);
    if (fileErrors.length > 0) {
      errors.push(...fileErrors.map((msg) => `${fileName}: ${msg}`));
      continue;
    }

    files.push({ fileName, data: parseChineseDeckFile(raw) });
  }

  return { files, errors };
}

/** Nạp một file vào DB: tạo deck nếu chưa có, upsert từng thẻ theo chữ Hán. */
async function loadFile({ fileName, data }: LoadedFile): Promise<void> {
  const existing = await prisma.deck.findFirst({
    where: { name: data.deck.name, language: LANGUAGE, deletedAt: null },
  });

  const deck =
    existing ??
    (await prisma.deck.create({
      data: {
        name: data.deck.name,
        description: data.deck.description ?? null,
        color: data.deck.color ?? "#ef4444",
        icon: data.deck.icon ?? "🀄",
        language: LANGUAGE,
      },
    }));

  let created = 0;
  let updated = 0;

  for (const [index, card] of data.cards.entries()) {
    const current = await prisma.card.findFirst({
      where: { deckId: deck.id, word: card.word },
    });

    const fields = {
      meaning: card.meaning,
      phonetic: card.phonetic,
      sinoVietnamese: card.sinoVietnamese ?? null,
      partOfSpeech: card.partOfSpeech ?? null,
      hanziFormal: card.hanziFormal ?? null,
      strokeCount: card.strokeCount ?? null,
      radical: card.radical ?? null,
      example: card.example ?? null,
      examplePinyin: card.examplePinyin ?? null,
      exampleTranslation: card.exampleTranslation ?? null,
      note: card.note ?? null,
      order: index,
      // Chủ ý khôi phục thẻ đã xoá mềm: file JSON là nguồn sự thật của deck này.
      deletedAt: null,
    };

    if (current) {
      await prisma.card.update({ where: { id: current.id }, data: fields });
      updated += 1;
    } else {
      await prisma.card.create({
        data: { deckId: deck.id, word: card.word, ...fields },
      });
      created += 1;
    }
  }

  console.log(
    `✅ ${fileName} → "${deck.name}": ${created} thẻ mới, ${updated} thẻ cập nhật`,
  );
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  const { files, errors } = readAllFiles();

  if (errors.length > 0) {
    console.error(`❌ Có ${errors.length} lỗi — KHÔNG ghi gì vào DB:`);
    for (const err of errors) console.error(`   • ${err}`);
    process.exitCode = 1;
    return;
  }

  const totalCards = files.reduce((sum, f) => sum + f.data.cards.length, 0);
  console.log(`✔ ${files.length} file hợp lệ, tổng ${totalCards} thẻ.`);

  if (checkOnly) {
    console.log("(--check) Chỉ kiểm tra, không ghi DB.");
    return;
  }

  for (const file of files) {
    await loadFile(file);
  }
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi nạp dữ liệu tiếng Trung:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
