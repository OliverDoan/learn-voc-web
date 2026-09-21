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
const MARK_BAM = "🇬🇧🇺🇸 Anh–Mỹ";

// Word family (A: derivation đổi từ loại, B: từ ghép cùng gốc, C: borderline).
const FAMILIES: string[][] = [
  ["beginner", "beginning"],
  ["memorise", "memory"],
  ["engineering", "engineer"],
  ["live", "lively"],
  ["peaceful", "peace"],
  ["beautiful", "beautifully", "beauty"],
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
  ["useless", "useful", "user"],
  ["hometown", "homestay", "homesick"],
  ["housewife", "housemate"],
  ["room", "roommate"],
  ["stir-fry", "stir"],
  ["secretary", "secret"],
  ["health", "unhealthy"],
  ["pain", "painful", "painkiller"],
  ["forest", "rainforest"],
  ["bicycle", "tricycle", "cyclist"],
  ["luck", "lucky"],
  ["celebration", "celebrity"],
  ["film", "film maker"],
  ["quiet", "quietly"],
  ["sing", "singer"],
  ["art", "artist", "artistic", "artwork"],
  ["photography", "photographer"],
  ["personal", "personally"],
  ["attention", "attend"],
  ["reliable", "rely"],
  ["unfriend", "friendly", "friendship"],
  ["information", "inform"],
  ["support", "supporter"],
  ["change", "exchange"],
  ["marriage", "married"],
  ["argue", "argument"],
  ["interested", "interest"],
  ["strange", "stranger"],
  ["attract", "attractive"],
  ["ordinary", "extraordinary"],
  ["special", "especially"],
  ["play", "playful"],
  ["sociable", "socially"],
  ["type", "typical"],
  ["serious", "seriously"],
];

// Từ liên quan (đồng nghĩa / cùng trường nghĩa). Mỗi nhóm cần >= 2 deck mới ghi.
const RELATED: string[][] = [
  ["chance", "opportunity"], // cơ hội
  ["chat", "communicate"], // trò chuyện / giao tiếp
  ["expensive", "pricey"], // đắt đỏ
  ["cheap", "affordable", "reasonable"], // rẻ / phải chăng / hợp lý
  ["cook", "chef"], // đầu bếp
  ["yummy", "tasty", "delicious"], // ngon
  ["awful", "nasty", "terrible", "crappy"], // tệ / kinh khủng
  ["visitor", "tourist", "guest"], // khách / du khách
  ["scared", "nervous", "anxious", "fear"], // sợ / lo lắng
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
  ["common", "popular", "normal", "familiar", "typical", "ordinary"], // phổ biến / bình thường
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
  ["coach", "trainer"], // huấn luyện viên
  ["mountain", "hill", "valley"], // địa hình: núi / đồi / thung lũng
  ["fast", "quickly", "speedy"], // nhanh
  ["fix", "repair"], // sửa chữa
  ["prevent", "protect"], // ngăn ngừa / bảo vệ
  ["beautiful", "gorgeous", "attractive", "good-looking"], // đẹp / ưa nhìn
  ["mindful", "meditate"], // chú tâm / thiền
  ["damage", "injure", "hurt"], // gây hại / làm bị thương
  ["exercise", "practice", "train"], // tập luyện / rèn luyện
  ["vehicle", "motorbike", "truck"], // phương tiện
  ["exhausted", "tiring"], // mệt / kiệt sức
  ["fan", "supporter", "enthusiast"], // người hâm mộ / người ủng hộ / người đam mê
  ["paparazzi", "photographer"], // thợ săn ảnh / thợ chụp ảnh
  ["fancy", "luxury", "classy"], // sang chảnh / xa xỉ / sang trọng
  ["shiny", "sparkling"], // bóng loáng / lấp lánh
  ["loud", "noisy"], // to tiếng / ồn ào
  ["catchy", "popular"], // bắt tai / được ưa chuộng
  ["upbeat", "cheerful", "joyful"], // sôi động / vui vẻ / hân hoan
  ["encourage", "support"], // khích lệ / ủng hộ
  ["perform", "show"], // biểu diễn / buổi diễn
  ["instrument", "guitar", "flute", "drum"], // nhạc cụ
  ["shout", "scream"], // hét / thét
  ["well-known", "popular"], // nổi tiếng / phổ biến
  ["frequently", "regularly"], // thường xuyên
  ["fantastic", "amazing", "extraordinary"], // tuyệt vời / phi thường
  ["theatre", "drama"], // nhà hát / tác phẩm kịch
  ["concert", "musician"], // buổi hoà nhạc / nhạc sĩ
  ["remember", "memorise"], // nhớ / ghi nhớ
  ["delete", "remove"], // xoá / loại bỏ
  ["outdated", "modern"], // lỗi thời <-> hiện đại
  ["power", "energy"], // nguồn điện, sức mạnh / năng lượng
  ["marriage", "divorce"], // hôn nhân <-> ly hôn
  ["romance", "lover"], // chuyện tình / người yêu
  ["stranger", "foreigner"], // người lạ / người nước ngoài
  ["figure", "body"], // vóc dáng / cơ thể
  ["kind", "generous", "friendly"], // tử tế / hào phóng / thân thiện
  ["neat", "tidy"], // gọn gàng / ngăn nắp
  ["mad", "angry", "annoyed"], // tức giận / bực bội
  ["funny", "comedy"], // hài hước / phim hài
  ["trust", "reliable"], // tin tưởng / đáng tin cậy
  ["easy-going", "calm"], // dễ tính / điềm tĩnh
  ["hyper", "active"], // tăng động / năng động
  ["judge", "consider"], // đánh giá / cân nhắc
  ["result", "effect"], // kết quả / tác động
  ["attitude", "opinion"], // thái độ / quan điểm
  ["depressed", "disappointed"], // chán nản / thất vọng
  ["ashamed", "embarrassed"], // xấu hổ / ngượng ngùng
  ["delighted", "excited", "joyful"], // vui sướng / phấn khích / hân hoan
  ["happiness", "satisfied", "joyful"], // hạnh phúc / hài lòng / hân hoan
  ["moody", "short-tempered"], // thất thường / nóng tính
  ["serious", "strict"], // nghiêm túc / nghiêm khắc
  ["pamper", "spoil"], // chiều chuộng / làm hư
  ["helpful", "useful"], // hữu ích
  ["laugh", "cry"], // cười <-> khóc
  ["homesick", "lonely"], // nhớ nhà / cô đơn
  ["mood", "vibe", "atmosphere"], // tâm trạng / không khí
];

// Biến thể Anh–Anh (BrE) ↔ Anh–Mỹ (AmE): từ khác hẳn (flat↔apartment) hoặc khác chính tả.
// Key = word (lowercase), value = phần ghi sau marker. Ghi cho MỌI card có word đó.
const BRIT_AMER: Record<string, string> = {
  // Khác từ vựng
  flat: "AmE: apartment",
  pavement: "AmE: sidewalk",
  rubbish: "AmE: garbage / trash",
  takeaway: "AmE: takeout",
  chemist: "AmE: drugstore (dược sĩ: pharmacist)",
  footballer: "AmE: soccer player (football = soccer)",
  motorbike: "AmE: motorcycle",
  truck: "BrE: lorry",
  timetable: "AmE: schedule",
  primary: "AmE: elementary (school)",
  mathematics: "AmE: math (BrE tắt: maths)",
  "film maker": "AmE hay dùng: movie (thay cho film)",
  // Khác chính tả
  neighbour: "AmE (chính tả): neighbor",
  neighbourhood: "AmE (chính tả): neighborhood",
  centre: "AmE (chính tả): center",
  favourite: "AmE (chính tả): favorite",
  litre: "AmE (chính tả): liter",
  savoury: "AmE (chính tả): savory",
  cosy: "AmE (chính tả): cozy",
  ageing: "AmE (chính tả): aging",
  memorise: "AmE (chính tả): memorize",
  enroll: "BrE (chính tả): enrol",
  travelling: "AmE (chính tả): traveling",
  practice: "BrE động từ (chính tả): practise",
  racquet: "AmE (chính tả): racket",
  packet: "AmE thường: pack",
};

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
    .filter(
      (line) =>
        !line.startsWith(MARK_FAM) &&
        !line.startsWith(MARK_REL) &&
        !line.startsWith(MARK_BAM),
    )
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
    const bam = BRIT_AMER[c.word.trim().toLowerCase()];
    if (bam) lines.push(`${MARK_BAM}: ${bam}`);

    const newNote = [base, ...lines].filter(Boolean).join("\n") || null;
    const hadMarker =
      !!c.note &&
      (c.note.includes(MARK_FAM) || c.note.includes(MARK_REL) || c.note.includes(MARK_BAM));
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
