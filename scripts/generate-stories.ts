/**
 * Sinh THÊM truyện chêm cho từng deck bằng Claude API. Mỗi truyện chứa ĐỦ toàn bộ
 * từ của deck dưới dạng [[word|nghĩa]] để dùng cho bài "Điền truyện chêm".
 *
 * Mặc định: thêm 5 truyện mới cho MỖI deck (không xoá truyện cũ). Mỗi truyện được
 * kiểm tra độ phủ từ (lib/story-coverage.ts); truyện thiếu/thừa từ sẽ được yêu cầu
 * viết lại (tối đa MAX_ROUNDS vòng). Không thay đổi thứ tự thẻ trong deck.
 *
 * Yêu cầu: ANTHROPIC_API_KEY trong .env (ANTHROPIC_MODEL tuỳ chọn).
 * Chạy:  pnpm gen:stories                      # thêm 5 truyện/deck cho mọi deck
 *        pnpm gen:stories -- --add 3           # thêm 3 truyện/deck
 *        pnpm gen:stories -- --target 6        # bù cho đủ 6 truyện/deck (bỏ qua deck đã đủ)
 *        UNIT="Unit 3:" pnpm gen:stories       # chỉ 1 deck (khớp tiền tố tên)
 *        pnpm gen:stories -- --dry-run         # chỉ in ra, không ghi DB
 */
import { PrismaClient } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { extractWords } from "../lib/story-parser";
import { checkStoryCoverage } from "../lib/story-coverage";

const prisma = new PrismaClient();

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";
const MAX_ROUNDS = 3;
const CONCURRENCY = 3;

interface Options {
  add: number;
  target: number | null;
  dryRun: boolean;
  unit: string | null;
}

function parseArgs(argv: string[]): Options {
  const read = (flag: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const add = Number(read("--add") ?? 5);
  const targetRaw = read("--target");
  const target = targetRaw ? Number(targetRaw) : null;
  if (!Number.isInteger(add) || add < 1) throw new Error("--add phải là số nguyên ≥ 1");
  if (target !== null && (!Number.isInteger(target) || target < 1)) {
    throw new Error("--target phải là số nguyên ≥ 1");
  }
  return { add, target, dryRun: argv.includes("--dry-run"), unit: process.env.UNIT?.trim() || null };
}

// Output của model là dữ liệu không tin cậy → validate bằng Zod trước khi dùng.
const draftSchema = z.object({
  stories: z.array(
    z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      contentEn: z.string().default(""),
    }),
  ),
});
type StoryDraft = z.infer<typeof draftSchema>["stories"][number];

interface WordInput {
  word: string;
  meaning: string;
  partOfSpeech: string | null;
}

const SAVE_TOOL: Anthropic.Tool = {
  name: "save_stories",
  description: "Lưu danh sách truyện chêm vừa viết.",
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      stories: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string", description: "Tiêu đề tiếng Việt, ngắn gọn, khác các truyện đã có" },
            content: {
              type: "string",
              description: "Văn tiếng Việt có chêm từ tiếng Anh dạng [[word|nghĩa]]; đoạn cách nhau bằng dòng trống",
            },
            contentEn: { type: "string", description: "Bản tiếng Anh đầy đủ của truyện (văn xuôi, không markup)" },
          },
          required: ["title", "content", "contentEn"],
        },
      },
    },
    required: ["stories"],
  },
};

const SYSTEM =
  "Bạn là tác giả viết truyện chêm cho người Việt học từ vựng tiếng Anh trình độ A2–B1. " +
  "Truyện chêm = văn nền tiếng Việt tự nhiên, trong đó các từ vựng mục tiêu được chêm dưới dạng " +
  "[[word|nghĩa]] (word = từ tiếng Anh, nghĩa = nghĩa tiếng Việt). Văn phong gần gũi, mạch truyện " +
  "liền lạc, có từ nối; câu vẫn phải đọc trôi chảy nếu thay [[word|nghĩa]] bằng phần nghĩa.";

function buildPrompt(
  deckName: string,
  words: WordInput[],
  existing: Array<{ title: string; content: string }>,
  count: number,
  feedback: string[],
): string {
  const list = words
    .map((w) => `- "${w.word}"${w.partOfSpeech ? ` (${w.partOfSpeech})` : ""} — ${w.meaning}`)
    .join("\n");

  const sample = existing[0]
    ? `\nTruyện mẫu đã có (tham khảo định dạng, KHÔNG lặp lại cốt truyện):\n"""\n${existing[0].content}\n"""\n`
    : "";
  const titles = existing.length
    ? `\nTiêu đề đã dùng (tránh trùng): ${existing.map((s) => `"${s.title}"`).join(", ")}\n`
    : "";
  const fb = feedback.length ? `\nLỖI LẦN TRƯỚC CẦN SỬA:\n${feedback.map((f) => `- ${f}`).join("\n")}\n` : "";

  return (
    `Deck: ${deckName}\n` +
    `Danh sách ${words.length} từ vựng (BẮT BUỘC dùng đủ trong MỖI truyện):\n${list}\n` +
    sample +
    titles +
    fb +
    `\nHãy viết ${count} truyện chêm KHÁC NHAU rõ rệt về bối cảnh, nhân vật và thể loại ` +
    `(ví dụ: nhật ký, thư/email, đoạn hội thoại, bài blog, bản tin, truyện ngắn, lời kể lại...). ` +
    `Ưu tiên ngôi thứ nhất ("tôi").\n` +
    `Yêu cầu bắt buộc cho MỖI truyện:\n` +
    `1. Chứa TẤT CẢ ${words.length} từ trong danh sách, mỗi từ đúng 1 lần, dạng [[word|nghĩa]].\n` +
    `2. "word" phải giống HỆT chuỗi trong danh sách (chữ thường, không thêm -s/-ed/-ing, không đổi dạng từ).\n` +
    `3. "nghĩa" là nghĩa tiếng Việt cho sẵn (có thể rút gọn lấy nghĩa đầu tiên; viết hoa chữ đầu nếu đứng đầu câu).\n` +
    `4. KHÔNG chêm từ ngoài danh sách; không dùng [[ ]] cho bất kỳ từ khác.\n` +
    `5. Văn nền tiếng Việt tự nhiên, 3–5 đoạn (~180–280 chữ), các đoạn cách nhau bằng dòng trống.\n` +
    `6. contentEn: bản tiếng Anh đầy đủ của truyện, dùng đúng các từ vựng đó, không markup.\n` +
    `Gọi tool save_stories với đúng ${count} truyện.`
  );
}

async function askClaude(client: Anthropic, prompt: string): Promise<StoryDraft[]> {
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 64000,
    thinking: { type: "adaptive" },
    system: SYSTEM,
    tools: [SAVE_TOOL],
    tool_choice: { type: "auto" },
    messages: [{ role: "user", content: prompt }],
  });
  const res = await stream.finalMessage();
  if (res.stop_reason === "refusal") throw new Error("Claude từ chối yêu cầu (stop_reason=refusal)");
  if (res.stop_reason === "max_tokens") {
    throw new Error("Output bị cắt (max_tokens) — giảm số truyện mỗi lượt (--add nhỏ hơn)");
  }

  const toolUse = res.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
  if (!toolUse) throw new Error("Claude không gọi tool save_stories");
  const parsed = draftSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Tool input không hợp lệ — ${issues}`);
  }
  return parsed.data.stories.map((s) => ({
    title: s.title.trim(),
    content: s.content.trim(),
    contentEn: s.contentEn.trim(),
  }));
}

/** Kiểm tra 1 bản nháp; trả về danh sách lỗi (rỗng = hợp lệ). */
function validateDraft(draft: StoryDraft, words: string[], usedTitles: Set<string>): string[] {
  const errors: string[] = [];
  if (!draft.title) errors.push("thiếu tiêu đề");
  if (usedTitles.has(draft.title.toLowerCase())) errors.push(`tiêu đề "${draft.title}" bị trùng`);
  const cov = checkStoryCoverage(draft.content, words);
  if (cov.missing.length) errors.push(`thiếu từ: ${cov.missing.join(", ")}`);
  if (cov.unmatched.length) errors.push(`chêm từ ngoài danh sách: ${cov.unmatched.join(", ")}`);
  if (cov.duplicated.length) console.warn(`   ⚠️  "${draft.title}" chêm lặp: ${cov.duplicated.join(", ")}`);
  return errors;
}

interface DeckResult {
  deckName: string;
  added: string[];
  failed: number;
}

async function generateForDeck(
  client: Anthropic,
  deck: { id: string; name: string },
  opts: Options,
): Promise<DeckResult> {
  const cards = await prisma.card.findMany({
    where: { deckId: deck.id, deletedAt: null },
    orderBy: { order: "asc" },
    select: { id: true, word: true, meaning: true, partOfSpeech: true },
  });
  const existing = await prisma.story.findMany({
    where: { deckId: deck.id },
    orderBy: { createdAt: "asc" },
    select: { title: true, content: true },
  });

  const need = opts.target !== null ? Math.max(0, opts.target - existing.length) : opts.add;
  if (cards.length === 0 || need === 0) {
    console.log(`⏭️  ${deck.name}: bỏ qua (thẻ=${cards.length}, truyện=${existing.length}, cần thêm=${need})`);
    return { deckName: deck.name, added: [], failed: 0 };
  }
  console.log(`\n📖 ${deck.name}: ${cards.length} từ, đã có ${existing.length} truyện → viết thêm ${need}`);

  const words = cards.map((c) => c.word.trim());
  const wordToCard = new Map(cards.map((c) => [c.word.trim().toLowerCase(), c.id]));
  const usedTitles = new Set(existing.map((s) => s.title.toLowerCase()));
  const accepted: StoryDraft[] = [];
  let feedback: string[] = [];

  for (let round = 1; round <= MAX_ROUNDS && accepted.length < need; round++) {
    const remaining = need - accepted.length;
    const prompt = buildPrompt(
      deck.name,
      cards,
      [...existing, ...accepted.map((s) => ({ title: s.title, content: s.content }))],
      remaining,
      feedback,
    );
    let drafts: StoryDraft[];
    try {
      drafts = await askClaude(client, prompt);
    } catch (error) {
      console.error(`   ❌ vòng ${round} lỗi API:`, error instanceof Error ? error.message : error);
      continue;
    }

    feedback = [];
    for (const draft of drafts.slice(0, remaining)) {
      const errors = validateDraft(draft, words, usedTitles);
      if (errors.length) {
        feedback.push(`Truyện "${draft.title}": ${errors.join("; ")}`);
        console.log(`   ✗ vòng ${round} "${draft.title}" → ${errors.join("; ")}`);
        continue;
      }
      accepted.push(draft);
      usedTitles.add(draft.title.toLowerCase());
      console.log(`   ✓ vòng ${round} "${draft.title}" (${extractWords(draft.content).length} từ chêm)`);
    }
  }

  if (!opts.dryRun) {
    for (const draft of accepted) {
      const links = extractWords(draft.content)
        .map((t) => wordToCard.get(t.word.toLowerCase()))
        .filter((id): id is string => !!id)
        .filter((id, idx, arr) => arr.indexOf(id) === idx)
        .map((cardId, order) => ({ cardId, order }));
      await prisma.story.create({
        data: {
          deckId: deck.id,
          title: draft.title,
          content: draft.content,
          contentEn: draft.contentEn || null,
          storyCards: { create: links },
        },
      });
    }
  } else {
    for (const draft of accepted) console.log(`\n--- ${draft.title} ---\n${draft.content}\n\n[EN]\n${draft.contentEn}`);
  }

  return { deckName: deck.name, added: accepted.map((s) => s.title), failed: need - accepted.length };
}

/** Chạy các task với số luồng giới hạn, giữ nguyên thứ tự kết quả. */
async function runPool<T>(tasks: Array<() => Promise<T>>, limit: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ Thiếu ANTHROPIC_API_KEY. Thêm vào file .env rồi chạy lại (xem .env.example).");
    process.exit(1);
  }
  const client = new Anthropic();

  const decks = await prisma.deck.findMany({
    where: { deletedAt: null, ...(opts.unit ? { name: { startsWith: opts.unit } } : {}) },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });
  if (decks.length === 0) {
    console.warn(`⚠️  Không tìm thấy deck nào${opts.unit ? ` khớp UNIT="${opts.unit}"` : ""}.`);
    return;
  }
  // UNIT="Unit 1" (thiếu dấu ":") sẽ khớp cả Unit 10–19 → chặn để không gọi API nhầm hàng loạt.
  if (opts.unit && decks.length > 1) {
    console.error(`❌ UNIT="${opts.unit}" khớp ${decks.length} deck — hãy dùng tiền tố đầy đủ, ví dụ "Unit 1:".`);
    process.exitCode = 1;
    return;
  }
  console.log(
    `🤖 Model: ${MODEL} | ${decks.length} deck | ` +
      (opts.target !== null ? `bù đủ ${opts.target} truyện/deck` : `thêm ${opts.add} truyện/deck`) +
      (opts.dryRun ? " | DRY-RUN (không ghi DB)" : ""),
  );

  const results = await runPool(
    decks.map((deck) => () => generateForDeck(client, deck, opts)),
    CONCURRENCY,
  );

  console.log("\n===== TỔNG KẾT =====");
  for (const r of results) {
    console.log(`${r.failed ? "⚠️ " : "✅"} ${r.deckName}: +${r.added.length}${r.failed ? ` (thiếu ${r.failed})` : ""}`);
  }
  const totalAdded = results.reduce((s, r) => s + r.added.length, 0);
  const totalFailed = results.reduce((s, r) => s + r.failed, 0);
  console.log(`\nTổng: +${totalAdded} truyện${totalFailed ? `, ${totalFailed} truyện chưa sinh được` : ""}.`);
  if (totalFailed > 0) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
