/**
 * Ghi quan hệ giữa các từ chéo deck vào field `note`:
 *   📚 Cùng họ từ   = word family (derivation / từ ghép cùng gốc)
 *   🔗 Từ liên quan = đồng nghĩa / cùng trường nghĩa
 * Idempotent: tự xoá các dòng marker cũ trước khi ghi lại, giữ phần note khác.
 *
 * Mặc định DRY-RUN (chỉ in, không ghi). Ghi thật: APPLY=1.
 * Chạy: pnpm notes:wordfamily            (xem trước)
 *       APPLY=1 pnpm notes:wordfamily    (ghi thật)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DRY = process.env.APPLY !== "1";
const MARK_FAM = "📚 Cùng họ từ";
const MARK_REL = "🔗 Từ liên quan";

// Word family (A: derivation đổi từ loại, B: từ ghép cùng gốc, C: borderline).
const FAMILIES: string[][] = [
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
  ["hometown", "homestay"],
  ["housewife", "housemate"],
  ["room", "roommate"],
  ["stir-fry", "stir"],
  ["secretary", "secret"],
];

// Từ liên quan (đồng nghĩa / cùng trường nghĩa). Mỗi nhóm cần >= 2 deck mới ghi.
const RELATED: string[][] = [
  ["chance", "opportunity"], // cơ hội
  ["expensive", "pricey"], // đắt đỏ
  ["cheap", "affordable", "reasonable"], // rẻ / phải chăng / hợp lý
  ["cook", "chef"], // đầu bếp
  ["yummy", "tasty", "delicious"], // ngon
  ["awful", "nasty", "terrible", "crappy"], // tệ / kinh khủng
  ["visitor", "tourist", "guest"], // khách / du khách
  ["scared", "nervous"], // sợ / lo lắng
  ["bustling", "lively", "vibrant"], // nhộn nhịp / sôi động
  ["crowded", "cramped"], // đông đúc / chật chội
  ["district", "neighbourhood", "area", "block"], // khu vực / khu phố
  ["highway", "alley", "pavement", "route"], // đường / lối đi
  ["accommodation", "flat", "place"], // chỗ ở / nơi
  ["topic", "subject"], // chủ đề
  ["course", "curriculum"], // khoá học / chương trình
  ["understand", "know"], // hiểu / biết
  ["announce", "inform", "tell"], // thông báo
  ["improve", "develop"], // cải thiện / phát triển
  ["common", "popular", "normal", "familiar", "typical"], // phổ biến / bình thường
  ["difficulty", "challenging", "complicated"], // khó / thử thách / phức tạp
  ["comfortable", "cosy", "chilled", "pleasant"], // thoải mái / dễ chịu
  ["safe", "security"], // an toàn / an ninh
  ["avoid", "escape"], // tránh / trốn
  ["surprise", "amazing"], // bất ngờ / kinh ngạc
  ["control", "manage"], // điều khiển / quản lý
  ["modern", "traditional"], // hiện đại <-> truyền thống
  ["religion", "Buddhist", "believe", "pray", "priest"], // tôn giáo
  ["holiday", "leisure"], // nghỉ ngơi / thời gian rảnh
  ["view", "sightseeing"], // khung cảnh / ngắm cảnh
  ["boil", "grill", "stir-fry", "roast"], // cách nấu
  ["stir", "pour", "add", "mix"], // thao tác bếp
  ["groceries", "ingredient"], // nguyên liệu / thực phẩm
  ["taste", "flavour"], // nếm / hương vị
  ["sweet", "savoury", "spicy", "oily", "sour"], // vị (hương vị)
  ["hangry", "thirsty", "hunger"], // đói / khát
  ["crop", "plant", "harvest"], // trồng trọt
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

/** Bỏ các dòng marker cũ, giữ phần còn lại của note. */
function stripMarkers(note: string | null): string {
  if (!note) return "";
  return note
    .split("\n")
    .filter((line) => !line.startsWith(MARK_FAM) && !line.startsWith(MARK_REL))
    .join("\n")
    .trim();
}

type CardRow = { id: string; word: string; partOfSpeech: string | null; note: string | null; deck: { name: string } };
type Member = { word: string; pos: string; unit: number };

/** cardId -> danh sách thành viên khác (cùng nhóm, đã loại chính nó). */
function buildRelations(groups: string[][], byWord: Map<string, CardRow[]>): Map<string, Member[]> {
  const result = new Map<string, Member[]>();
  for (const group of groups) {
    const cards = group.flatMap((w) => byWord.get(w.toLowerCase()) ?? []);
    if (new Set(cards.map((c) => c.deck.name)).size < 2) continue; // chỉ ghi nhóm chéo deck
    for (const self of cards) {
      const others = cards
        .filter((o) => o.id !== self.id)
        .map((o) => ({ word: o.word, pos: posShort(o.partOfSpeech), unit: unitNum(o.deck.name) }))
        .sort((a, b) => a.unit - b.unit);
      if (others.length) result.set(self.id, others);
    }
  }
  return result;
}

function formatLine(marker: string, members: Member[]): string {
  const list = members.map((m) => `${m.word}${m.pos ? ` (${m.pos})` : ""} – Unit ${m.unit}`).join(", ");
  return `${marker}: ${list}`;
}

async function main() {
  const cards = (await prisma.card.findMany({
    where: { deletedAt: null, deck: { deletedAt: null } },
    include: { deck: true },
  })) as CardRow[];

  const byWord = new Map<string, CardRow[]>();
  for (const c of cards) {
    const key = c.word.trim().toLowerCase();
    const arr = byWord.get(key) ?? [];
    arr.push(c);
    byWord.set(key, arr);
  }

  const famRel = buildRelations(FAMILIES, byWord);
  const relRel = buildRelations(RELATED, byWord);

  let changed = 0;
  for (const c of cards) {
    const base = stripMarkers(c.note);
    const lines: string[] = [];
    const fam = famRel.get(c.id);
    const rel = relRel.get(c.id);
    if (fam) lines.push(formatLine(MARK_FAM, fam));
    if (rel) lines.push(formatLine(MARK_REL, rel));

    const newNote = [base, ...lines].filter(Boolean).join("\n") || null;
    const hadMarker = !!c.note && (c.note.includes(MARK_FAM) || c.note.includes(MARK_REL));
    if (newNote !== (c.note ?? null) && (lines.length || hadMarker)) {
      changed++;
      console.log(`U${unitNum(c.deck.name)} ${c.word.padEnd(16)} => ${newNote?.replace(/\n/g, " ⏎ ")}`);
      if (!DRY) await prisma.card.update({ where: { id: c.id }, data: { note: newNote } });
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
