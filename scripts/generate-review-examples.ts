/**
 * Sinh LẠI câu ví dụ cho các Unit sau sao cho mỗi câu vừa chứa từ của thẻ,
 * vừa chêm ít nhất 1 từ đã học ở các Unit TRƯỚC (ôn lại từ cũ).
 * Câu ví dụ này dùng cho bài "Viết lại câu" (dịch Việt → Anh) và "Điền từ vào câu".
 *
 * Unit đầu tiên không có từ cũ nên được bỏ qua.
 *
 * Yêu cầu: ANTHROPIC_API_KEY trong .env
 *
 * Chạy:
 *   pnpm gen:review-examples                 # chỉ những thẻ chưa chêm được từ cũ
 *   pnpm gen:review-examples --all           # viết lại toàn bộ thẻ của các Unit sau
 *   pnpm gen:review-examples --deck="Unit 3" # giới hạn theo tên deck (khớp một phần)
 *   pnpm gen:review-examples --dry-run       # chỉ in ra, không ghi DB
 */
import { PrismaClient } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";
import { containsWord, findReviewWords } from "../lib/sentence-review";
import { getDeckUnitNumber } from "../lib/deck-progress";

const prisma = new PrismaClient();

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const REGEN_ALL = process.argv.includes("--all");
const DRY_RUN = process.argv.includes("--dry-run");
const DECK_FILTER =
  process.argv.find((a) => a.startsWith("--deck="))?.slice("--deck=".length).trim() ?? "";

/** Số thẻ gửi Claude mỗi lượt gọi. */
const BATCH_SIZE = 12;
/** Số từ cũ gợi ý kèm mỗi thẻ (model chọn 1–2 từ trong đó). */
const REVIEW_CANDIDATES = 6;
/** Số lần thử lại cho những thẻ chưa đạt yêu cầu. */
const MAX_RETRIES = 2;

interface ExampleItem {
  word: string;
  example: string;
  exampleTranslation: string;
}

interface CardInput {
  id: string;
  word: string;
  meaning: string;
  partOfSpeech: string | null;
  /** Các từ cũ gợi ý cho riêng thẻ này */
  reviewWords: string[];
}

const SAVE_TOOL: Anthropic.Tool = {
  name: "save_examples",
  description: "Lưu câu ví dụ đã tạo cho từng từ.",
  input_schema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            word: { type: "string", description: "Từ vựng chính (đúng như đầu vào)" },
            example: {
              type: "string",
              description: "Câu tiếng Anh chứa từ vựng chính VÀ ít nhất 1 từ ôn tập",
            },
            exampleTranslation: {
              type: "string",
              description: "Bản dịch tiếng Việt tự nhiên của câu",
            },
          },
          required: ["word", "example", "exampleTranslation"],
        },
      },
    },
    required: ["items"],
  },
};

const SYSTEM =
  "Bạn là giáo viên tiếng Anh soạn câu ví dụ cho học viên Việt Nam trình độ A2–B1. " +
  "Câu phải tự nhiên, dễ hiểu, độ dài 8–16 từ, đúng ngữ cảnh nghĩa của từ. " +
  "Bản dịch tiếng Việt phải tự nhiên như người Việt nói, không dịch word-by-word.";

function buildPrompt(cards: readonly CardInput[]): string {
  const list = cards
    .map(
      (c) =>
        `- Từ chính: "${c.word}"${c.partOfSpeech ? ` (${c.partOfSpeech})` : ""} — nghĩa: ${c.meaning}\n` +
        `  Từ ôn tập gợi ý (chọn 1–2 từ): ${c.reviewWords.join(", ")}`,
    )
    .join("\n");

  return (
    `Tạo cho MỖI từ chính dưới đây một câu ví dụ tiếng Anh.\n` +
    `Yêu cầu BẮT BUỘC cho mỗi câu:\n` +
    `1. Chứa chính xác từ chính (đúng chính tả; có thể viết hoa đầu câu).\n` +
    `2. Chứa ít nhất 1 từ trong danh sách "Từ ôn tập gợi ý" của chính từ đó ` +
    `(được phép chia dạng: số nhiều, quá khứ, V-ing...).\n` +
    `3. Ngữ cảnh khớp nghĩa tiếng Việt của từ chính, câu phải tự nhiên — ` +
    `KHÔNG nhồi nhét từ một cách gượng ép.\n` +
    `4. Kèm bản dịch tiếng Việt của câu.\n` +
    `Gọi tool save_examples với đúng ${cards.length} mục.\n\n` +
    `Danh sách:\n${list}`
  );
}

async function generateForBatch(
  client: Anthropic,
  cards: readonly CardInput[],
): Promise<Map<string, ExampleItem>> {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM,
    tools: [SAVE_TOOL],
    tool_choice: { type: "tool", name: "save_examples" },
    messages: [{ role: "user", content: buildPrompt(cards) }],
  });

  const toolUse = res.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
  if (!toolUse) throw new Error("Claude không trả về tool_use");

  const items = (toolUse.input as { items?: ExampleItem[] }).items ?? [];
  return new Map(items.map((it) => [it.word.trim().toLowerCase(), it]));
}

/** Xáo trộn + lấy n phần tử (không đổi mảng gốc). */
function sample<T>(items: readonly T[], n: number): T[] {
  return [...items].sort(() => Math.random() - 0.5).slice(0, n);
}

function chunk<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Lỗi không thể khắc phục bằng thử lại (hết credit, sai API key...) → dừng hẳn. */
class FatalApiError extends Error {}

/** Rút gọn lỗi từ SDK thành 1 dòng; ném FatalApiError nếu thử lại cũng vô ích. */
function describeApiError(error: unknown): string {
  const status = (error as { status?: number })?.status;
  const message =
    (error as { error?: { error?: { message?: string } } })?.error?.error?.message ??
    (error instanceof Error ? error.message : String(error));

  if (status === 401 || status === 403) {
    throw new FatalApiError(`API key không hợp lệ hoặc không có quyền: ${message}`);
  }
  if (/credit balance/i.test(message)) {
    throw new FatalApiError(
      "Tài khoản Anthropic đã hết credit. Nạp thêm ở Plans & Billing rồi chạy lại script.",
    );
  }
  return `HTTP ${status ?? "?"}: ${message}`;
}

interface Accepted {
  card: CardInput;
  item: ExampleItem;
  reviewWords: string[];
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "❌ Thiếu ANTHROPIC_API_KEY. Thêm vào file .env rồi chạy lại.\n" +
        "   Xem .env.example để biết định dạng.",
    );
    process.exit(1);
  }

  const client = new Anthropic();
  // Thứ tự Unit lấy từ TÊN deck ("Unit 10: ..." → 10), giống logic khóa tuần tự
  // trong lib/deck-progress.ts — KHÔNG dùng createdAt vì có deck được tạo sau
  // nhưng số Unit lại nhỏ hơn (vd Unit 24 tạo sau Unit 30).
  const allDecks = await prisma.deck.findMany({ where: { deletedAt: null } });
  const decks = allDecks
    .map((d) => ({ deck: d, unit: getDeckUnitNumber(d.name) }))
    .filter((x): x is { deck: (typeof allDecks)[number]; unit: number } => x.unit !== null)
    .sort((a, b) => a.unit - b.unit)
    .map((x) => x.deck);

  const skipped = allDecks.length - decks.length;
  if (skipped > 0) {
    console.log(`ℹ️  Bỏ qua ${skipped} deck không có số Unit trong tên (không nằm trong chuỗi tuần tự).`);
  }

  // Từ đã học tính dồn qua các Unit trước.
  const previousWords: string[] = [];
  let totalUpdated = 0;
  let totalFailed = 0;

  for (const [index, deck] of decks.entries()) {
    const cards = await prisma.card.findMany({
      where: { deckId: deck.id, deletedAt: null },
      orderBy: { order: "asc" },
    });
    const deckWords = cards.map((c) => c.word);

    const skipDeck = index === 0 || (DECK_FILTER && !deck.name.includes(DECK_FILTER));
    if (skipDeck) {
      if (index === 0) console.log(`⏭️  ${deck.name}: Unit đầu tiên, không có từ cũ để chêm.`);
      previousWords.push(...deckWords);
      continue;
    }

    if (previousWords.length === 0 || cards.length === 0) {
      previousWords.push(...deckWords);
      continue;
    }

    // Mặc định chỉ xử lý thẻ chưa chêm được từ cũ (hoặc chưa có ví dụ).
    const todo = cards.filter((c) => {
      if (REGEN_ALL) return true;
      const example = c.example?.trim();
      if (!example || !c.exampleTranslation?.trim()) return true;
      return findReviewWords(example, previousWords).length === 0;
    });

    if (todo.length === 0) {
      console.log(`✅ ${deck.name}: tất cả câu ví dụ đã có từ của Unit trước.`);
      previousWords.push(...deckWords);
      continue;
    }

    console.log(
      `\n📄 ${deck.name}: viết lại ${todo.length}/${cards.length} câu ` +
        `(chêm từ trong ${previousWords.length} từ đã học).`,
    );

    let pending: CardInput[] = todo.map((c) => ({
      id: c.id,
      word: c.word,
      meaning: c.meaning,
      partOfSpeech: c.partOfSpeech,
      reviewWords: sample(previousWords, REVIEW_CANDIDATES),
    }));
    const accepted: Accepted[] = [];

    for (let attempt = 0; attempt <= MAX_RETRIES && pending.length > 0; attempt++) {
      if (attempt > 0) {
        console.log(`   🔁 Thử lại lần ${attempt} cho ${pending.length} thẻ...`);
        // Đổi bộ từ gợi ý để model có lựa chọn khác.
        pending = pending.map((c) => ({
          ...c,
          reviewWords: sample(previousWords, REVIEW_CANDIDATES),
        }));
      }

      const failed: CardInput[] = [];
      for (const batch of chunk(pending, BATCH_SIZE)) {
        let resultMap: Map<string, ExampleItem>;
        try {
          resultMap = await generateForBatch(client, batch);
        } catch (error) {
          console.error(`   ⚠️  Lỗi gọi Claude — ${describeApiError(error)}`);
          failed.push(...batch);
          continue;
        }

        for (const card of batch) {
          const item = resultMap.get(card.word.trim().toLowerCase());
          const example = item?.example?.trim();
          const translation = item?.exampleTranslation?.trim();
          if (!item || !example || !translation) {
            failed.push(card);
            continue;
          }
          // Validate: câu phải chứa từ chính VÀ ít nhất 1 từ của Unit trước.
          if (!containsWord(example, card.word)) {
            failed.push(card);
            continue;
          }
          const reviewWords = findReviewWords(example, previousWords);
          if (reviewWords.length === 0) {
            failed.push(card);
            continue;
          }
          accepted.push({ card, item: { ...item, example, exampleTranslation: translation }, reviewWords });
        }
      }
      pending = failed;
    }

    for (const { card, item, reviewWords } of accepted) {
      console.log(`   • ${card.word}: ${item.example}  [ôn: ${reviewWords.join(", ")}]`);
      if (DRY_RUN) continue;
      await prisma.card.update({
        where: { id: card.id },
        data: { example: item.example, exampleTranslation: item.exampleTranslation },
      });
    }
    totalUpdated += accepted.length;

    if (pending.length > 0) {
      totalFailed += pending.length;
      console.warn(
        `   ⚠️  ${pending.length} thẻ chưa đạt sau ${MAX_RETRIES + 1} lượt: ` +
          pending.map((c) => c.word).join(", "),
      );
    }

    previousWords.push(...deckWords);
  }

  console.log(
    `\n${DRY_RUN ? "🔍 (dry-run) " : "✅ "}Hoàn tất: ${totalUpdated} câu ví dụ đã chêm từ Unit trước` +
      (totalFailed ? `, ${totalFailed} thẻ chưa đạt (chạy lại để thử tiếp).` : "."),
  );
}

main()
  .catch((e) => {
    if (e instanceof FatalApiError) console.error(`\n❌ ${e.message}`);
    else console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
