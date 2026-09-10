/**
 * Nạp truyện chêm bổ sung từ prisma/story-data/*.json vào DB (bù cho seed-stories.ts
 * vốn chỉ giữ 1 truyện gốc/deck). Mỗi file là 1 deck, mỗi truyện phải chứa ĐỦ toàn bộ
 * từ của deck dạng [[word|nghĩa]] — kiểm tra bằng lib/story-coverage.ts trước khi ghi.
 *
 * Định dạng file (prisma/story-data/unit-01.json):
 *   { "deckName": "Unit 1:", "stories": [ { "title", "content", "contentEn"? } ] }
 *
 * Chạy:  pnpm stories:load                 # kiểm tra + nạp mọi file (bỏ qua truyện đã có cùng tiêu đề)
 *        pnpm stories:load -- --check      # chỉ kiểm tra, không ghi DB
 *        pnpm stories:load -- --words "Unit 4:"   # in danh sách từ của deck (để viết truyện)
 *        UNIT="Unit 4:" pnpm stories:load  # chỉ xử lý 1 deck
 */
import { PrismaClient } from "@prisma/client";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { extractWords } from "../lib/story-parser";
import { checkStoryCoverage } from "../lib/story-coverage";

const prisma = new PrismaClient();
const DATA_DIR = path.resolve(process.cwd(), "prisma/story-data");

const storyFileSchema = z.object({
  deckName: z.string().min(1),
  stories: z
    .array(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        contentEn: z.string().optional(),
      }),
    )
    .min(1),
});
type StoryFile = z.infer<typeof storyFileSchema>;

function readArg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  const value = i >= 0 ? process.argv[i + 1] : undefined;
  return value && !value.startsWith("--") ? value : undefined;
}

/** Tìm deck theo tiền tố tên; báo lỗi nếu khớp nhiều deck (vd "Unit 1" khớp cả Unit 10–19). */
async function findDeck(deckName: string) {
  const matches = await prisma.deck.findMany({
    where: { name: { startsWith: deckName }, deletedAt: null },
    take: 2,
  });
  if (matches.length > 1) {
    throw new Error(`"${deckName}" khớp nhiều deck — hãy dùng tiền tố đầy đủ, ví dụ "Unit 1:"`);
  }
  return matches[0] ?? null;
}

async function printWords(deckName: string) {
  const deck = await findDeck(deckName);
  if (!deck) throw new Error(`Không tìm thấy deck "${deckName}"`);
  const cards = await prisma.card.findMany({
    where: { deckId: deck.id, deletedAt: null },
    orderBy: { order: "asc" },
    select: { word: true, meaning: true, partOfSpeech: true },
  });
  console.log(`# ${deck.name} — ${cards.length} từ`);
  for (const c of cards) console.log(`- "${c.word}"${c.partOfSpeech ? ` (${c.partOfSpeech})` : ""} — ${c.meaning}`);
}

function loadFiles(only: string | null): Array<{ file: string; data: StoryFile }> {
  let names: string[];
  try {
    names = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json")).sort();
  } catch {
    console.warn(`⚠️  Chưa có thư mục ${DATA_DIR}`);
    return [];
  }
  return names.flatMap((file) => {
    let json: unknown;
    try {
      json = JSON.parse(readFileSync(path.join(DATA_DIR, file), "utf8"));
    } catch (error) {
      console.error(`❌ ${file}: không đọc/parse được JSON —`, error instanceof Error ? error.message : error);
      process.exitCode = 1;
      return [];
    }
    const parsed = storyFileSchema.safeParse(json);
    if (!parsed.success) {
      console.error(`❌ ${file}: sai định dạng —`, parsed.error.issues.map((i) => i.message).join("; "));
      process.exitCode = 1;
      return [];
    }
    if (only && parsed.data.deckName !== only) return [];
    return [{ file, data: parsed.data }];
  });
}

interface FileResult {
  file: string;
  deckName: string;
  valid: number;
  invalid: number;
  created: number;
  skipped: number;
}

async function processFile(file: string, data: StoryFile, checkOnly: boolean): Promise<FileResult> {
  const result: FileResult = { file, deckName: data.deckName, valid: 0, invalid: 0, created: 0, skipped: 0 };
  const deck = await findDeck(data.deckName);
  if (!deck) {
    console.error(`❌ ${file}: không tìm thấy deck "${data.deckName}"`);
    return { ...result, invalid: data.stories.length };
  }

  const cards = await prisma.card.findMany({
    where: { deckId: deck.id, deletedAt: null },
    select: { id: true, word: true },
  });
  const words = cards.map((c) => c.word.trim());
  const wordToCard = new Map(cards.map((c) => [c.word.trim().toLowerCase(), c.id]));
  const existing = await prisma.story.findMany({ where: { deckId: deck.id }, select: { title: true } });
  const existingTitles = new Set(existing.map((s) => s.title.toLowerCase()));

  // Tiêu đề trùng trong cùng file cũng là lỗi (khó phân biệt khi chọn truyện).
  const seenTitles = new Set<string>();
  console.log(`\n📖 ${file} → ${deck.name} (${words.length} từ, ${existing.length} truyện đã có)`);

  for (const story of data.stories) {
    const cov = checkStoryCoverage(story.content, words);
    const errors: string[] = [];
    if (cov.missing.length) errors.push(`thiếu ${cov.missing.length} từ: ${cov.missing.join(", ")}`);
    if (cov.unmatched.length) errors.push(`từ ngoài deck: ${cov.unmatched.join(", ")}`);
    if (seenTitles.has(story.title.toLowerCase())) errors.push("tiêu đề trùng trong file");
    seenTitles.add(story.title.toLowerCase());

    if (errors.length) {
      result.invalid++;
      console.log(`   ✗ "${story.title}": ${errors.join(" | ")}`);
      continue;
    }
    result.valid++;
    const dup = cov.duplicated.length ? ` (lặp: ${cov.duplicated.join(", ")})` : "";
    if (checkOnly) {
      console.log(`   ✓ "${story.title}"${dup}`);
      continue;
    }
    if (existingTitles.has(story.title.toLowerCase())) {
      result.skipped++;
      console.log(`   ⏭️  "${story.title}" đã có trong DB`);
      continue;
    }

    const links = extractWords(story.content)
      .map((t) => wordToCard.get(t.word.toLowerCase()))
      .filter((id): id is string => !!id)
      .filter((id, idx, arr) => arr.indexOf(id) === idx)
      .map((cardId, order) => ({ cardId, order }));
    await prisma.story.create({
      data: {
        deckId: deck.id,
        title: story.title,
        content: story.content,
        contentEn: story.contentEn?.trim() || null,
        storyCards: { create: links },
      },
    });
    result.created++;
    console.log(`   ✅ "${story.title}" → link ${links.length}/${cards.length} thẻ${dup}`);
  }
  return result;
}

async function main() {
  const wordsFor = readArg("--words");
  if (wordsFor) return printWords(wordsFor);

  const checkOnly = process.argv.includes("--check");
  const only = process.env.UNIT?.trim() || null;
  const files = loadFiles(only);
  if (files.length === 0) {
    console.warn("⚠️  Không có file truyện nào để xử lý.");
    return;
  }

  const results: FileResult[] = [];
  for (const { file, data } of files) results.push(await processFile(file, data, checkOnly));

  console.log(`\n===== TỔNG KẾT${checkOnly ? " (chỉ kiểm tra)" : ""} =====`);
  for (const r of results) {
    const mark = r.invalid ? "⚠️ " : "✅";
    console.log(
      `${mark} ${r.deckName} hợp lệ ${r.valid}, lỗi ${r.invalid}` +
        (checkOnly ? "" : `, tạo mới ${r.created}, bỏ qua ${r.skipped}`),
    );
  }
  if (results.some((r) => r.invalid)) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
