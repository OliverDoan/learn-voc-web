/**
 * Sinh NGHĨA TIẾNG VIỆT của TỪ GỐC (rootWord) cho mỗi thẻ bằng Claude API.
 * Chỉ xử lý thẻ có từ gốc KHÁC với từ chính (vd word="certificate", rootWord="certify (verb)").
 *
 * Mặc định chỉ điền thẻ đang TRỐNG nghĩa từ gốc. Truyền --all để ghi đè toàn bộ.
 *
 * Yêu cầu: ANTHROPIC_API_KEY trong .env
 * Chạy: pnpm gen:root-meanings   (hoặc: npx tsx --env-file=.env scripts/generate-root-meanings.ts)
 */
import { PrismaClient } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";

const prisma = new PrismaClient();

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const OVERWRITE_ALL = process.argv.includes("--all");
const CHUNK_SIZE = 25;
const MAX_LEN = 200;

interface RootItem {
  word: string;
  meaning: string;
}

/** Phần lemma của rootWord, bỏ "(pos)" ở cuối — để so sánh với từ chính. */
function rootBase(rootWord: string): string {
  return rootWord.replace(/\s*\([^)]*\)\s*$/, "").trim().toLowerCase();
}

const SAVE_TOOL: Anthropic.Tool = {
  name: "save_root_meanings",
  description: "Lưu nghĩa tiếng Việt của từ gốc cho từng từ.",
  input_schema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            word: { type: "string", description: "Từ vựng (đúng như đầu vào)" },
            meaning: {
              type: "string",
              description:
                "Nghĩa tiếng Việt NGẮN GỌN của TỪ GỐC (không phải của từ vựng). " +
                "Vd từ gốc 'certify (verb)' → 'chứng nhận, xác nhận'. Tối đa ~15 từ.",
            },
          },
          required: ["word", "meaning"],
        },
      },
    },
    required: ["items"],
  },
};

const SYSTEM =
  "Bạn là giáo viên tiếng Anh. Với mỗi mục, hãy giải nghĩa TIẾNG VIỆT cho TỪ GỐC được cung cấp " +
  "(KHÔNG phải nghĩa của từ vựng phái sinh). Nghĩa ngắn gọn, đúng loại từ trong ngoặc. " +
  "Nếu từ gốc là cụm ghép (vd 'house (noun) + mate (noun)'), giải nghĩa từng thành phần, " +
  "ngăn cách bằng ' + '. Chỉ dùng tiếng Việt phổ thông, không bịa, không thêm chú thích thừa.";

async function generateForChunk(
  client: Anthropic,
  rows: { word: string; rootWord: string; meaning: string }[],
): Promise<Map<string, string>> {
  const list = rows
    .map((r) => `- từ "${r.word}" (nghĩa: ${r.meaning}) → từ gốc cần giải nghĩa: "${r.rootWord}"`)
    .join("\n");

  const prompt =
    `Giải nghĩa tiếng Việt cho TỪ GỐC của mỗi mục dưới đây.\n` +
    `Gọi tool save_root_meanings với đúng ${rows.length} mục, đúng thứ tự, "word" giữ nguyên.\n\n` +
    `Danh sách:\n${list}`;

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM,
    tools: [SAVE_TOOL],
    tool_choice: { type: "tool", name: "save_root_meanings" },
    messages: [{ role: "user", content: prompt }],
  });

  const toolUse = res.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
  );
  if (!toolUse) throw new Error("Claude không trả về tool_use");

  const items = (toolUse.input as { items: RootItem[] }).items ?? [];
  return new Map(
    items
      .filter((it) => typeof it.word === "string" && typeof it.meaning === "string")
      .map((it) => [it.word.trim().toLowerCase(), it.meaning.trim().slice(0, MAX_LEN)]),
  );
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ Thiếu ANTHROPIC_API_KEY. Thêm vào .env rồi chạy lại. Xem .env.example.");
    process.exit(1);
  }

  const client = new Anthropic();
  const decks = await prisma.deck.findMany({ orderBy: { createdAt: "asc" } });

  let filled = 0;
  let processed = 0;

  for (const deck of decks) {
    const cards = await prisma.card.findMany({
      where: { deckId: deck.id, deletedAt: null, rootWord: { not: null } },
      orderBy: { order: "asc" },
      select: { id: true, word: true, rootWord: true, meaning: true, rootWordMeaning: true },
    });

    // Chỉ thẻ có từ gốc khác từ chính
    let targets = cards.filter(
      (c) => c.rootWord && rootBase(c.rootWord) && rootBase(c.rootWord) !== c.word.trim().toLowerCase(),
    );
    if (!OVERWRITE_ALL) targets = targets.filter((c) => !c.rootWordMeaning);
    if (targets.length === 0) continue;

    console.log(`\n📄 ${deck.name}: xử lý ${targets.length} từ...`);

    for (let i = 0; i < targets.length; i += CHUNK_SIZE) {
      const chunk = targets.slice(i, i + CHUNK_SIZE);
      let map: Map<string, string>;
      try {
        map = await generateForChunk(
          client,
          chunk.map((c) => ({ word: c.word, rootWord: c.rootWord as string, meaning: c.meaning })),
        );
      } catch (error) {
        console.error(`   ⚠️  Lỗi gọi Claude:`, error);
        continue;
      }

      for (const card of chunk) {
        const meaning = map.get(card.word.trim().toLowerCase());
        if (!meaning) continue;
        await prisma.card.update({
          where: { id: card.id },
          data: { rootWordMeaning: meaning },
        });
        filled++;
        processed++;
      }
      console.log(`   ✓ ${Math.min(i + CHUNK_SIZE, targets.length)}/${targets.length}`);
    }
  }

  console.log(`\n✅ Hoàn tất: ${processed} thẻ xử lý — ${filled} thẻ đã có nghĩa từ gốc.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
