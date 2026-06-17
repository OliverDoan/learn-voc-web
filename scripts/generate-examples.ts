/**
 * Sinh câu ví dụ (kèm bản dịch tiếng Việt) cho các thẻ còn thiếu `example`
 * bằng Claude API. Mỗi câu ví dụ chứa chính xác từ vựng để dùng được cho
 * bài "Điền từ vào câu" (gap-fill).
 *
 * Mặc định chỉ xử lý thẻ THIẾU ví dụ. Truyền --all để sinh lại toàn bộ.
 *
 * Yêu cầu: ANTHROPIC_API_KEY trong .env
 * Chạy: npx tsx scripts/generate-examples.ts
 *        npx tsx scripts/generate-examples.ts --all
 */
import { PrismaClient } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";

const prisma = new PrismaClient();

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const REGEN_ALL = process.argv.includes("--all");

interface ExampleItem {
  word: string;
  example: string;
  exampleTranslation: string;
}

const SAVE_TOOL: Anthropic.Tool = {
  name: "save_examples",
  description: "Lưu danh sách câu ví dụ đã tạo cho từng từ.",
  input_schema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            word: { type: "string", description: "Từ vựng (đúng như đầu vào)" },
            example: { type: "string", description: "Câu ví dụ tiếng Anh chứa chính xác từ" },
            exampleTranslation: { type: "string", description: "Bản dịch tiếng Việt của câu" },
          },
          required: ["word", "example", "exampleTranslation"],
        },
      },
    },
    required: ["items"],
  },
};

const SYSTEM =
  "Bạn là giáo viên tiếng Anh tạo câu ví dụ cho học viên Việt Nam trình độ A2–B1. " +
  "Câu ngắn gọn (8–14 từ), tự nhiên, đúng ngữ cảnh nghĩa của từ.";

interface WordInput {
  word: string;
  meaning: string;
  partOfSpeech: string | null;
}

async function generateForBatch(
  client: Anthropic,
  words: WordInput[],
): Promise<Map<string, ExampleItem>> {
  const list = words
    .map((w) => `- "${w.word}"${w.partOfSpeech ? ` (${w.partOfSpeech})` : ""} — ${w.meaning}`)
    .join("\n");

  const prompt =
    `Tạo cho MỖI từ dưới đây một câu ví dụ tiếng Anh.\n` +
    `Yêu cầu bắt buộc:\n` +
    `1. Câu PHẢI chứa chính xác từ đã cho (đúng chính tả, có thể viết hoa đầu câu).\n` +
    `2. Ngữ cảnh khớp với nghĩa tiếng Việt đi kèm.\n` +
    `3. Kèm bản dịch tiếng Việt tự nhiên.\n` +
    `Gọi tool save_examples với đúng ${words.length} mục.\n\n` +
    `Danh sách từ:\n${list}`;

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM,
    tools: [SAVE_TOOL],
    tool_choice: { type: "tool", name: "save_examples" },
    messages: [{ role: "user", content: prompt }],
  });

  const toolUse = res.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
  );
  if (!toolUse) throw new Error("Claude không trả về tool_use");

  const items = (toolUse.input as { items: ExampleItem[] }).items ?? [];
  return new Map(items.map((it) => [it.word.trim().toLowerCase(), it]));
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

  const decks = await prisma.deck.findMany({ orderBy: { createdAt: "asc" } });
  let totalUpdated = 0;
  let totalMismatch = 0;

  for (const deck of decks) {
    const cards = await prisma.card.findMany({
      where: {
        deckId: deck.id,
        ...(REGEN_ALL ? {} : { OR: [{ example: null }, { example: "" }] }),
      },
      orderBy: { order: "asc" },
    });
    if (cards.length === 0) continue;

    console.log(`\n📄 ${deck.name}: sinh ví dụ cho ${cards.length} từ...`);

    let resultMap: Map<string, ExampleItem>;
    try {
      resultMap = await generateForBatch(
        client,
        cards.map((c) => ({ word: c.word, meaning: c.meaning, partOfSpeech: c.partOfSpeech })),
      );
    } catch (error) {
      console.error(`   ⚠️  Lỗi gọi Claude cho "${deck.name}":`, error);
      continue;
    }

    for (const card of cards) {
      const item = resultMap.get(card.word.trim().toLowerCase());
      if (!item || !item.example.trim()) {
        console.warn(`   • Không có ví dụ cho "${card.word}"`);
        continue;
      }
      // Kiểm tra câu có chứa đúng từ (cho gap-fill)
      const re = new RegExp(`\\b${card.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (!re.test(item.example)) {
        totalMismatch++;
        console.warn(`   ⚠️  Câu không chứa từ "${card.word}": ${item.example}`);
      }
      await prisma.card.update({
        where: { id: card.id },
        data: {
          example: item.example.trim(),
          exampleTranslation: item.exampleTranslation.trim() || null,
        },
      });
      totalUpdated++;
    }
  }

  console.log(
    `\n✅ Hoàn tất: ${totalUpdated} thẻ có ví dụ mới` +
      (totalMismatch ? ` (${totalMismatch} câu chưa chứa đúng từ — nên rà lại)` : ""),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
