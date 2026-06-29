/**
 * Ghi quan hệ "cùng họ từ" (word family) chéo deck vào field `note` của từng card.
 * Idempotent: tự xoá dòng "📚 Cùng họ từ" cũ trước khi ghi lại, giữ nguyên phần note khác.
 *
 * Mặc định DRY-RUN (chỉ in, không ghi). Ghi thật: APPLY=1.
 * Chạy: npx tsx --env-file=.env scripts/add-wordfamily-notes.ts
 *       APPLY=1 npx tsx --env-file=.env scripts/add-wordfamily-notes.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DRY = process.env.APPLY !== "1";
const MARKER = "📚 Cùng họ từ";

// Mỗi family = danh sách từ thành viên (so khớp chính xác, lowercase).
// A = word family thật, B = từ ghép cùng gốc, C = borderline (secretary↔secret).
const FAMILIES: string[][] = [
  // A. Word family (đổi từ loại)
  ["beginner", "beginning"],
  ["memorise", "memory"],
  ["engineering", "engineer"],
  ["live", "lively"],
  ["peaceful", "peace"],
  ["beautiful", "beautifully"],
  ["meaning", "mean"],
  ["tell", "bank teller"],
  ["receptionist", "reception"],
  ["employee", "employer", "employed"],
  ["cook", "cooking", "undercooked", "home-cooked"],
  ["design", "designer"],
  ["offer", "offering"],
  ["manager", "manage"],
  ["qualified", "quality"],
  ["builder", "build", "building"],
  ["price", "pricey"],
  ["various", "variety"],
  ["service", "serve"],
  ["exciting", "excited"],
  ["comfortable", "comfy"],
  ["tour", "tourist", "touristy"],
  ["taste", "tasty"],
  ["lover", "lovely", "loved one"],
  ["season", "seasoning"],
  ["useless", "useful"],
  // B. Từ ghép cùng gốc
  ["hometown", "homestay"],
  ["housewife", "housemate"],
  ["room", "roommate"],
  ["stir-fry", "stir"],
  // C. Borderline
  ["secretary", "secret"],
];

function unitNum(deckName: string): number {
  const m = deckName.match(/Unit (\d+)/);
  return m ? Number(m[1]) : 999;
}

function posShort(pos: string | null): string {
  if (!pos) return "";
  return pos
    .replace(/adjective/gi, "adj")
    .replace(/adverb/gi, "adv")
    .replace(/noun/gi, "n")
    .replace(/verb/gi, "v")
    .replace(/\s*\/\s*/g, "/")
    .trim();
}

/** Bỏ dòng marker cũ, giữ phần còn lại của note. */
function stripMarker(note: string | null): string {
  if (!note) return "";
  return note
    .split("\n")
    .filter((line) => !line.startsWith(MARKER))
    .join("\n")
    .trim();
}

async function main() {
  const cards = await prisma.card.findMany({
    where: { deletedAt: null, deck: { deletedAt: null } },
    include: { deck: true },
  });

  // word(lowercase) -> các card khớp
  const byWord = new Map<string, typeof cards>();
  for (const c of cards) {
    const key = c.word.trim().toLowerCase();
    const arr = byWord.get(key) ?? [];
    arr.push(c);
    byWord.set(key, arr);
  }

  // cardId -> danh sách "thành viên khác" cần ghi
  const noteFor = new Map<string, { word: string; pos: string; unit: number }[]>();

  for (const fam of FAMILIES) {
    // gom mọi card thuộc family
    const memberCards = fam.flatMap((w) => byWord.get(w.toLowerCase()) ?? []);
    const decks = new Set(memberCards.map((c) => c.deckId));
    if (decks.size < 2) continue; // chỉ ghi family chéo deck

    for (const self of memberCards) {
      const others = memberCards
        .filter((o) => o.id !== self.id)
        .map((o) => ({ word: o.word, pos: posShort(o.partOfSpeech), unit: unitNum(o.deck.name) }))
        .sort((a, b) => a.unit - b.unit);
      if (others.length) noteFor.set(self.id, others);
    }
  }

  let changed = 0;
  for (const c of cards) {
    const others = noteFor.get(c.id);
    const base = stripMarker(c.note);
    let newNote: string | null;
    if (others && others.length) {
      const list = others.map((o) => `${o.word}${o.pos ? ` (${o.pos})` : ""} – Unit ${o.unit}`).join(", ");
      const line = others.length === 1 ? `${MARKER}: ${list}` : `${MARKER}: ${list}`;
      newNote = base ? `${base}\n${line}` : line;
    } else {
      // không thuộc family -> đảm bảo không còn marker cũ sót
      newNote = base || null;
    }

    if (newNote !== (c.note ?? null) && (others?.length || (c.note && c.note.includes(MARKER)))) {
      changed++;
      console.log(`U${unitNum(c.deck.name)} ${c.word.padEnd(16)} => ${newNote?.replace(/\n/g, " ⏎ ")}`);
      if (!DRY) {
        await prisma.card.update({ where: { id: c.id }, data: { note: newNote } });
      }
    }
  }

  console.log(`\n${DRY ? "[DRY-RUN] sẽ" : "[APPLIED] đã"} cập nhật ${changed} card.`);
  if (DRY) console.log("Chạy lại với APPLY=1 để ghi thật.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
