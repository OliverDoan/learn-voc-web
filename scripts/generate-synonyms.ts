/**
 * Sinh từ ĐỒNG NGHĨA / TRÁI NGHĨA *phổ biến, hay dùng trong IELTS* (CEFR A1–C1)
 * cho mỗi thẻ bằng Claude API. Chọn lọc ít mà chất — bỏ từ hiếm/cổ/học thuật ít dùng.
 *
 * Mặc định GHI ĐÈ toàn bộ (thay dữ liệu nhiễu cũ từ từ điển).
 * Truyền --missing để chỉ điền các thẻ đang trống.
 *
 * Yêu cầu: ANTHROPIC_API_KEY trong .env
 * Chạy: pnpm gen:synonyms   (hoặc: npx tsx --env-file=.env scripts/generate-synonyms.ts)
 */
import { PrismaClient } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";

const prisma = new PrismaClient();

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const ONLY_MISSING = process.argv.includes("--missing");
const CHUNK_SIZE = 25;
const MAX_SYNONYMS = 4;
const MAX_ANTONYMS = 3;

interface RelatedItem {
  word: string;
  synonyms: string[];
  antonyms: string[];
}

const SAVE_TOOL: Anthropic.Tool = {
  name: "save_related",
  description: "Lưu danh sách từ đồng nghĩa / trái nghĩa đã chọn cho từng từ.",
  input_schema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            word: { type: "string", description: "Từ vựng (đúng như đầu vào)" },
            synonyms: {
              type: "array",
              items: { type: "string" },
              description: `Tối đa ${MAX_SYNONYMS} từ đồng nghĩa phổ biến, có thể rỗng`,
            },
            antonyms: {
              type: "array",
              items: { type: "string" },
              description: `Tối đa ${MAX_ANTONYMS} từ trái nghĩa phổ biến, có thể rỗng`,
            },
          },
          required: ["word", "synonyms", "antonyms"],
        },
      },
    },
    required: ["items"],
  },
};

const SYSTEM =
  "Bạn là giáo viên IELTS. Với mỗi từ, chọn từ ĐỒNG NGHĨA và TRÁI NGHĨA THÔNG DỤNG, " +
  "hay gặp trong IELTS (Writing/Speaking), trình độ CEFR A1–C1. " +
  `Tối đa ${MAX_SYNONYMS} đồng nghĩa và ${MAX_ANTONYMS} trái nghĩa cho mỗi từ — ưu tiên ít mà chất. ` +
  "TUYỆT ĐỐI tránh từ hiếm, cổ, tiếng lóng, hoặc học thuật ít dùng. " +
  "Đồng/trái nghĩa phải khớp đúng nghĩa và loại từ đã cho. " +
  "Nếu không có từ phổ biến phù hợp, trả mảng rỗng. Không bịa.";

async function generateForChunk(
  client: Anthropic,
  words: { word: string; meaning: string; partOfSpeech: string | null }[],
): Promise<Map<string, RelatedItem>> {
  const list = words
    .map((w) => `- "${w.word}"${w.partOfSpeech ? ` (${w.partOfSpeech})` : ""} — ${w.meaning}`)
    .join("\n");

  const prompt =
    `Cho MỖI từ dưới đây, chọn đồng nghĩa và trái nghĩa thông dụng (IELTS, A1–C1).\n` +
    `Gọi tool save_related với đúng ${words.length} mục, đúng thứ tự.\n\n` +
    `Danh sách từ:\n${list}`;

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM,
    tools: [SAVE_TOOL],
    tool_choice: { type: "tool", name: "save_related" },
    messages: [{ role: "user", content: prompt }],
  });

  const toolUse = res.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
  );
  if (!toolUse) throw new Error("Claude không trả về tool_use");

  const items = (toolUse.input as { items: RelatedItem[] }).items ?? [];
  return new Map(items.map((it) => [it.word.trim().toLowerCase(), it]));
}

function clean(list: unknown, base: string, max: number): string[] {
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list) {
    if (typeof raw !== "string") continue;
    const value = raw.trim();
    const lower = value.toLowerCase();
    if (!value || lower === base || seen.has(lower)) continue;
    seen.add(lower);
    out.push(value);
    if (out.length >= max) break;
  }
  return out;
}

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
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ Thiếu ANTHROPIC_API_KEY. Thêm vào .env rồi chạy lại. Xem .env.example.");
    process.exit(1);
  }

  const client = new Anthropic();
  const decks = await prisma.deck.findMany({ orderBy: { createdAt: "asc" } });

  let withSyn = 0;
  let withAnt = 0;
  let processed = 0;

  for (const deck of decks) {
    const cards = await prisma.card.findMany({
      where: { deckId: deck.id, deletedAt: null },
      orderBy: { order: "asc" },
      select: {
        id: true,
        word: true,
        meaning: true,
        partOfSpeech: true,
        synonyms: true,
        antonyms: true,
      },
    });

    const targets = ONLY_MISSING
      ? cards.filter((c) => isEmptyList(c.synonyms) && isEmptyList(c.antonyms))
      : cards;
    if (targets.length === 0) continue;

    console.log(`\n📄 ${deck.name}: xử lý ${targets.length} từ...`);

    for (let i = 0; i < targets.length; i += CHUNK_SIZE) {
      const chunk = targets.slice(i, i + CHUNK_SIZE);
      let map: Map<string, RelatedItem>;
      try {
        map = await generateForChunk(
          client,
          chunk.map((c) => ({ word: c.word, meaning: c.meaning, partOfSpeech: c.partOfSpeech })),
        );
      } catch (error) {
        console.error(`   ⚠️  Lỗi gọi Claude:`, error);
        continue;
      }

      for (const card of chunk) {
        const item = map.get(card.word.trim().toLowerCase());
        const base = card.word.trim().toLowerCase();
        const synonyms = clean(item?.synonyms, base, MAX_SYNONYMS);
        const antonyms = clean(item?.antonyms, base, MAX_ANTONYMS);

        await prisma.card.update({
          where: { id: card.id },
          data: { synonyms: JSON.stringify(synonyms), antonyms: JSON.stringify(antonyms) },
        });

        if (synonyms.length > 0) withSyn++;
        if (antonyms.length > 0) withAnt++;
        processed++;
      }
      console.log(`   ✓ ${Math.min(i + CHUNK_SIZE, targets.length)}/${targets.length}`);
    }
  }

  console.log(
    `\n✅ Hoàn tất: ${processed} thẻ đã xử lý — ${withSyn} có đồng nghĩa, ${withAnt} có trái nghĩa.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
