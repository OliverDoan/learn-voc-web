import { extractWords, type StoryToken } from "@/lib/story-parser";

const VOWELS = "aeiou";

/** Dạng bất quy tắc thường gặp trong bộ từ (không suy ra được bằng quy tắc thêm đuôi). */
const IRREGULAR: Record<string, readonly string[]> = {
  admit: ["admitted", "admitting"],
  begin: ["began", "begun", "beginning"],
  bleed: ["bled"],
  break: ["broke", "broken"],
  bring: ["brought"],
  buy: ["bought"],
  catch: ["caught"],
  choose: ["chose", "chosen"],
  come: ["came"],
  drink: ["drank", "drunk"],
  drive: ["drove", "driven"],
  eat: ["ate", "eaten"],
  fall: ["fell", "fallen"],
  feel: ["felt"],
  find: ["found"],
  fly: ["flew", "flown"],
  forget: ["forgot", "forgotten", "forgetting"],
  get: ["got", "gotten", "getting"],
  give: ["gave", "given"],
  go: ["went", "gone", "goes"],
  grow: ["grew", "grown"],
  have: ["has", "had", "having"],
  hold: ["held"],
  keep: ["kept"],
  know: ["knew", "known"],
  leaf: ["leaves"],
  leave: ["left"],
  lie: ["lay", "lain", "lying"],
  lose: ["lost"],
  make: ["made"],
  meet: ["met"],
  pay: ["paid"],
  run: ["ran", "running"],
  say: ["said"],
  see: ["saw", "seen"],
  sell: ["sold"],
  send: ["sent"],
  sing: ["sang", "sung"],
  sit: ["sat", "sitting"],
  sleep: ["slept"],
  speak: ["spoke", "spoken"],
  spend: ["spent"],
  stand: ["stood"],
  swim: ["swam", "swum", "swimming"],
  take: ["took", "taken"],
  teach: ["taught"],
  tell: ["told"],
  think: ["thought"],
  throw: ["threw", "thrown"],
  understand: ["understood"],
  wake: ["woke", "woken"],
  wear: ["wore", "worn"],
  win: ["won", "winning"],
  write: ["wrote", "written"],
};

/** Có nhân đôi phụ âm cuối khi thêm -ed/-ing không (stop → stopped). Chỉ áp cho từ ngắn CVC. */
function doublesFinal(word: string): boolean {
  if (word.length < 3 || word.length > 4) return false;
  const [a, b, c] = word.slice(-3);
  return !VOWELS.includes(a) && VOWELS.includes(b) && !VOWELS.includes(c) && !"wxy".includes(c);
}

/**
 * Các dạng biến đổi của một từ đơn: số nhiều, ngôi 3, quá khứ, V-ing, so sánh
 * hơn/nhất, trạng từ -ly, cộng dạng bất quy tắc trong bảng.
 */
function inflect(word: string): string[] {
  const forms = new Set([word, `${word}s`, `${word}ed`, `${word}ing`, `${word}er`, `${word}est`, `${word}ly`]);
  if (/(s|x|z|ch|sh)$/.test(word)) forms.add(`${word}es`);
  if (/[^aeiou]y$/.test(word)) {
    const stem = word.slice(0, -1);
    for (const suffix of ["ies", "ied", "ier", "iest", "ily"]) forms.add(`${stem}${suffix}`);
  }
  if (word.endsWith("e")) {
    const stem = word.slice(0, -1);
    for (const form of [`${word}d`, `${stem}ing`, `${word}r`, `${word}st`]) forms.add(form);
  }
  if (doublesFinal(word)) {
    const last = word.slice(-1);
    for (const suffix of ["ed", "ing", "er", "est"]) forms.add(`${word}${last}${suffix}`);
  }
  for (const form of IRREGULAR[word] ?? []) forms.add(form);
  return [...forms];
}

/**
 * Các dạng có thể gặp của một từ vựng trong văn tiếng Anh. Cụm nhiều chữ biến đổi
 * chữ đầu ("drop out" → "dropped out") và thêm số nhiều cho chữ cuối ("loved ones").
 * Dạng bất quy tắc ngoài bảng `IRREGULAR` không bắt được.
 */
export function wordVariants(word: string): string[] {
  const parts = word.trim().toLowerCase().split(/\s+/);
  const [head, ...rest] = parts;
  if (!head) return [];
  if (rest.length === 0) return inflect(head);
  const tail = rest.join(" ");
  const forms = new Set(inflect(head).map((form) => `${form} ${tail}`));
  forms.add(`${parts.slice(0, -1).join(" ")} ${parts[parts.length - 1]}s`);
  return [...forms];
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Tách bản tiếng Anh thành token, đánh dấu từ vựng của truyện (lấy từ markup chêm
 * `[[word|nghĩa]]` trong `content`) để hiển thị giống chế độ chêm. Khớp không phân
 * biệt hoa thường, trọn từ, ưu tiên dạng dài hơn khi chồng nhau.
 */
export function highlightEnglish(contentEn: string, content: string): StoryToken[] {
  const entries = extractWords(content).map(({ word, meaning }) => ({ lemma: word.trim(), meaning }));
  const vocab = new Map<string, { lemma: string; meaning: string }>();
  // Từ gốc đăng ký trước để thắng dạng suy ra của từ khác ("winner" là thẻ riêng, không phải win + -er).
  for (const entry of entries) vocab.set(entry.lemma.toLowerCase(), entry);
  for (const entry of entries) {
    for (const form of wordVariants(entry.lemma)) {
      if (!vocab.has(form)) vocab.set(form, entry);
    }
  }
  if (vocab.size === 0) return contentEn ? [{ type: "text", text: contentEn }] : [];

  // Dạng dài trước để regex alternation bắt cụm dài nhất ("drop out" trước "drop").
  const pattern = [...vocab.keys()]
    .sort((a, b) => b.length - a.length)
    .map((form) => escapeRegExp(form).replace(/ /g, "\\s+"))
    .join("|");
  const re = new RegExp(`(?<![\\p{L}\\p{N}'-])(?:${pattern})(?![\\p{L}\\p{N}'-])`, "giu");

  const tokens: StoryToken[] = [];
  let last = 0;
  for (const match of contentEn.matchAll(re)) {
    const index = match.index ?? 0;
    const entry = vocab.get(match[0].toLowerCase().replace(/\s+/g, " "));
    if (!entry) continue;
    if (index > last) tokens.push({ type: "text", text: contentEn.slice(last, index) });
    tokens.push({ type: "word", word: match[0], meaning: entry.meaning, lemma: entry.lemma });
    last = index + match[0].length;
  }
  if (last < contentEn.length) tokens.push({ type: "text", text: contentEn.slice(last) });
  return tokens;
}
