/**
 * Dữ liệu Word Formation (tiền tố / hậu tố) + bộ phân tích cấu tạo từ.
 * Nguồn: bảng tra Word Formation (tiền tố & hậu tố tiếng Anh).
 *
 * Bộ phân tích `analyzeWord` mang tính GỢI Ý: dò tiền/hậu tố theo heuristic
 * (khớp đầu/cuối từ + độ dài gốc tối thiểu), nên đôi khi có thể chưa chuẩn.
 */

export type AffixCategory = "prefix" | "suffix";
export type WordClass = "danh từ" | "tính từ" | "động từ" | "trạng từ";

export interface Affix {
  id: string;
  /** Nhãn hiển thị, vd "-tion / -sion" hoặc "un-". */
  label: string;
  /** Các biến thể chữ cái để dò khớp, vd ["tion","sion"] hoặc ["un"]. */
  forms: string[];
  category: AffixCategory;
  /** Nhóm để gom trên trang tra cứu. */
  group: string;
  meaning: string;
  /** Loại từ mà hậu tố tạo ra (chủ yếu cho hậu tố). */
  makes?: WordClass;
  examples: string[];
  /** Có dùng trong bộ phân tích tự động không (tắt với affix dễ nhầm). */
  detect: boolean;
}

// --- HẬU TỐ (Suffixes) ---
const SUFFIX_DATA: Affix[] = [
  // Danh từ
  { id: "tion", label: "-tion / -sion", forms: ["tion", "sion"], category: "suffix", group: "Danh từ", meaning: "hành động, quá trình", makes: "danh từ", examples: ["creation", "decision", "attention", "suggestion", "admission"], detect: true },
  { id: "ment", label: "-ment", forms: ["ment"], category: "suffix", group: "Danh từ", meaning: "hành động, kết quả", makes: "danh từ", examples: ["development", "achievement", "improvement", "punishment"], detect: true },
  { id: "ness", label: "-ness", forms: ["ness"], category: "suffix", group: "Danh từ", meaning: "trạng thái, tính chất", makes: "danh từ", examples: ["happiness", "sadness", "kindness", "darkness", "weakness"], detect: true },
  { id: "ity", label: "-ity / -ty", forms: ["ity", "ty"], category: "suffix", group: "Danh từ", meaning: "tính chất", makes: "danh từ", examples: ["responsibility", "ability", "creativity", "reality", "curiosity"], detect: true },
  { id: "ence", label: "-ence / -ance", forms: ["ence", "ance"], category: "suffix", group: "Danh từ", meaning: "trạng thái, phẩm chất", makes: "danh từ", examples: ["importance", "difference", "existence", "resistance", "performance"], detect: true },
  { id: "er", label: "-er / -or", forms: ["er", "or"], category: "suffix", group: "Danh từ", meaning: "người, vật làm gì đó", makes: "danh từ", examples: ["teacher", "driver", "actor", "visitor", "competitor"], detect: false },
  { id: "ist", label: "-ist", forms: ["ist"], category: "suffix", group: "Danh từ", meaning: "người chuyên về gì", makes: "danh từ", examples: ["artist", "scientist", "pianist", "journalist", "economist"], detect: true },
  { id: "ship", label: "-ship", forms: ["ship"], category: "suffix", group: "Danh từ", meaning: "trạng thái, mối quan hệ", makes: "danh từ", examples: ["friendship", "leadership", "membership", "partnership", "citizenship"], detect: true },
  { id: "hood", label: "-hood", forms: ["hood"], category: "suffix", group: "Danh từ", meaning: "giai đoạn, quan hệ", makes: "danh từ", examples: ["childhood", "brotherhood", "neighborhood", "adulthood", "motherhood"], detect: true },
  // Tính từ
  { id: "ful", label: "-ful", forms: ["ful"], category: "suffix", group: "Tính từ", meaning: "đầy đủ", makes: "tính từ", examples: ["beautiful", "helpful", "powerful", "successful", "peaceful"], detect: true },
  { id: "less", label: "-less", forms: ["less"], category: "suffix", group: "Tính từ", meaning: "không có", makes: "tính từ", examples: ["helpless", "meaningless", "hopeless", "careless", "useless"], detect: true },
  { id: "ous", label: "-ous", forms: ["ous"], category: "suffix", group: "Tính từ", meaning: "có tính chất", makes: "tính từ", examples: ["dangerous", "nervous", "generous", "mysterious", "spacious"], detect: true },
  { id: "ive", label: "-ive", forms: ["ive"], category: "suffix", group: "Tính từ", meaning: "có xu hướng / tính chất", makes: "tính từ", examples: ["active", "creative", "sensitive", "expensive", "attractive"], detect: true },
  { id: "al-adj", label: "-al", forms: ["al"], category: "suffix", group: "Tính từ", meaning: "liên quan đến", makes: "tính từ", examples: ["natural", "national", "cultural", "traditional", "musical"], detect: false },
  { id: "ic", label: "-ic", forms: ["ic"], category: "suffix", group: "Tính từ", meaning: "thuộc về", makes: "tính từ", examples: ["poetic", "athletic", "scientific", "economic", "artistic"], detect: true },
  { id: "able", label: "-able / -ible", forms: ["able", "ible"], category: "suffix", group: "Tính từ", meaning: "có thể", makes: "tính từ", examples: ["readable", "enjoyable", "understandable", "visible", "reliable"], detect: true },
  { id: "y", label: "-y", forms: ["y"], category: "suffix", group: "Tính từ", meaning: "hơi, có tính chất", makes: "tính từ", examples: ["snowy", "messy", "funny", "cloudy", "healthy"], detect: false },
  { id: "ish", label: "-ish", forms: ["ish"], category: "suffix", group: "Tính từ", meaning: "hơi, có vẻ như", makes: "tính từ", examples: ["childish", "selfish", "reddish", "foolish", "greenish"], detect: true },
  // Trạng từ
  { id: "ly", label: "-ly", forms: ["ly"], category: "suffix", group: "Trạng từ", meaning: "cách thức (tạo trạng từ)", makes: "trạng từ", examples: ["quickly", "slowly", "carefully", "happily", "easily"], detect: true },
  // Động từ
  { id: "en", label: "-en", forms: ["en"], category: "suffix", group: "Động từ", meaning: "làm cho (từ tính từ)", makes: "động từ", examples: ["strengthen", "widen", "deepen", "lengthen", "darken"], detect: false },
  { id: "ify", label: "-ify / -fy", forms: ["ify", "fy"], category: "suffix", group: "Động từ", meaning: "làm cho trở thành", makes: "động từ", examples: ["simplify", "clarify", "justify", "intensify", "electrify"], detect: true },
  { id: "ize", label: "-ize / -ise", forms: ["ize", "ise"], category: "suffix", group: "Động từ", meaning: "gây ra, biến thành", makes: "động từ", examples: ["realize", "organize", "modernize", "apologize", "advertise"], detect: true },
];

// --- TIỀN TỐ (Prefixes) ---
const PREFIX_DATA: Affix[] = [
  // Phủ định / Trái nghĩa
  { id: "un", label: "un-", forms: ["un"], category: "prefix", group: "Phủ định / Trái nghĩa", meaning: "không", examples: ["unfair", "unclear", "unhappy", "unable", "unexpected"], detect: true },
  { id: "in", label: "in- / im- / il- / ir-", forms: ["in", "im", "il", "ir"], category: "prefix", group: "Phủ định / Trái nghĩa", meaning: "không, trái", examples: ["inactive", "impossible", "illegal", "irregular", "immature"], detect: false },
  { id: "dis", label: "dis-", forms: ["dis"], category: "prefix", group: "Phủ định / Trái nghĩa", meaning: "ngược lại", examples: ["dislike", "disagree", "disconnect", "dishonest", "disappear"], detect: true },
  { id: "non", label: "non-", forms: ["non"], category: "prefix", group: "Phủ định / Trái nghĩa", meaning: "không", examples: ["non-stop", "non-fiction", "non-verbal", "non-smoker", "non-profit"], detect: true },
  { id: "a", label: "a- / an-", forms: ["a", "an"], category: "prefix", group: "Phủ định / Trái nghĩa", meaning: "không, thiếu (gốc Hy Lạp)", examples: ["amoral", "asymmetrical", "apolitical", "atheist"], detect: false },
  // Mức độ / Vị trí / Lặp lại
  { id: "over", label: "over-", forms: ["over"], category: "prefix", group: "Mức độ / Vị trí / Lặp lại", meaning: "quá mức", examples: ["overeat", "overwork", "overreact", "overuse", "overconfident"], detect: true },
  { id: "under", label: "under-", forms: ["under"], category: "prefix", group: "Mức độ / Vị trí / Lặp lại", meaning: "dưới mức", examples: ["underestimate", "underpay", "underdeveloped", "undercooked", "underweight"], detect: true },
  { id: "out", label: "out-", forms: ["out"], category: "prefix", group: "Mức độ / Vị trí / Lặp lại", meaning: "vượt trội", examples: ["outperform", "outnumber", "outsmart", "outrun", "outgrow"], detect: true },
  { id: "sub", label: "sub-", forms: ["sub"], category: "prefix", group: "Mức độ / Vị trí / Lặp lại", meaning: "dưới, phụ", examples: ["submarine", "subconscious", "substandard", "subcategory", "subtitle"], detect: true },
  { id: "super", label: "super-", forms: ["super"], category: "prefix", group: "Mức độ / Vị trí / Lặp lại", meaning: "siêu", examples: ["superstar", "superhuman", "superpower", "supermarket", "superfast"], detect: true },
  { id: "pre", label: "pre-", forms: ["pre"], category: "prefix", group: "Mức độ / Vị trí / Lặp lại", meaning: "trước", examples: ["preview", "prehistoric", "preheat", "preschool", "prepay"], detect: true },
  { id: "post", label: "post-", forms: ["post"], category: "prefix", group: "Mức độ / Vị trí / Lặp lại", meaning: "sau", examples: ["postwar", "postgraduate", "postscript", "postmodern"], detect: true },
  { id: "re", label: "re-", forms: ["re"], category: "prefix", group: "Mức độ / Vị trí / Lặp lại", meaning: "lại, lần nữa", examples: ["redo", "rewrite", "return", "replay", "rebuild"], detect: false },
  // Nâng cao
  { id: "counter", label: "counter-", forms: ["counter"], category: "prefix", group: "Nâng cao", meaning: "đối lập, chống lại", examples: ["counteract", "counterargument", "counterproductive"], detect: true },
  { id: "mal", label: "mal-", forms: ["mal"], category: "prefix", group: "Nâng cao", meaning: "xấu, tệ", examples: ["malfunction", "malnutrition", "malpractice"], detect: true },
  { id: "pseudo", label: "pseudo-", forms: ["pseudo"], category: "prefix", group: "Nâng cao", meaning: "giả, không thật", examples: ["pseudonym", "pseudoscience", "pseudo-intellectual"], detect: true },
  { id: "ultra", label: "ultra-", forms: ["ultra"], category: "prefix", group: "Nâng cao", meaning: "cực kỳ, vượt mức", examples: ["ultramodern", "ultrasound", "ultraconservative"], detect: true },
  { id: "vice", label: "vice-", forms: ["vice"], category: "prefix", group: "Nâng cao", meaning: "phó, thay thế", examples: ["vice-president", "vice-chairman"], detect: true },
  { id: "arch", label: "arch-", forms: ["arch"], category: "prefix", group: "Nâng cao", meaning: "chính, đứng đầu", examples: ["archenemy", "archbishop", "archrival"], detect: true },
  { id: "neo", label: "neo-", forms: ["neo"], category: "prefix", group: "Nâng cao", meaning: "mới, hiện đại", examples: ["neoclassical", "neonatal", "neoliberal"], detect: true },
  { id: "hetero", label: "hetero-", forms: ["hetero"], category: "prefix", group: "Nâng cao", meaning: "khác biệt", examples: ["heterogeneous", "heterosexual"], detect: true },
  { id: "homo", label: "homo-", forms: ["homo"], category: "prefix", group: "Nâng cao", meaning: "giống nhau", examples: ["homogeneous", "homophone", "homonym"], detect: true },
  { id: "peri", label: "peri-", forms: ["peri"], category: "prefix", group: "Nâng cao", meaning: "xung quanh", examples: ["perimeter", "periscope", "perinatal"], detect: true },
  { id: "infra", label: "infra-", forms: ["infra"], category: "prefix", group: "Nâng cao", meaning: "dưới", examples: ["infrastructure", "infrared"], detect: true },
  { id: "supra", label: "supra-", forms: ["supra"], category: "prefix", group: "Nâng cao", meaning: "trên, vượt", examples: ["supranational", "supersonic"], detect: true },
  { id: "retro", label: "retro-", forms: ["retro"], category: "prefix", group: "Nâng cao", meaning: "quay ngược, theo kiểu cũ", examples: ["retroactive", "retrospect", "retrograde"], detect: true },
  { id: "semi", label: "semi- / hemi-", forms: ["semi", "hemi"], category: "prefix", group: "Nâng cao", meaning: "một nửa", examples: ["semicircle", "hemisphere"], detect: true },
  { id: "bene", label: "bene-", forms: ["bene"], category: "prefix", group: "Nâng cao", meaning: "tốt, tích cực", examples: ["beneficial", "benevolent", "benefactor"], detect: true },
];

export const AFFIXES: Affix[] = [...PREFIX_DATA, ...SUFFIX_DATA];
export const SUFFIXES = SUFFIX_DATA;
export const PREFIXES = PREFIX_DATA;

/** Thứ tự nhóm hiển thị trên trang tra cứu. */
export const SUFFIX_GROUPS = ["Danh từ", "Tính từ", "Trạng từ", "Động từ"];
export const PREFIX_GROUPS = [
  "Phủ định / Trái nghĩa",
  "Mức độ / Vị trí / Lặp lại",
  "Nâng cao",
];

const MIN_ROOT = 3;

/**
 * "Bạn giả" về tiền tố: các từ trông giống có tiền tố nhưng KHÔNG phải cấu tạo
 * từ tiền tố đó (vd "understand" không phải under + stand). Với các từ này, bỏ
 * qua dò tiền tố để tránh gợi ý sai.
 */
const PREFIX_FALSE_FRIENDS = new Set([
  // under-
  "understand", "understood", "understanding", "undergo", "undertake", "underline",
  // un-
  "uncle", "under", "until", "unit", "unite", "unique", "universe", "university", "union",
  // out-
  "outrage", "outrageous",
  // pre-
  "prefer", "present", "pretty", "precious", "pretend", "prevent", "president",
  // sub-
  "subject", "subtle", "submit",
  // over-
  "over",
  // dis-
  "dish", "disco",
  // re- (đã tắt detect, để phòng)
  "real", "ready", "reason",
]);

export interface WordAnalysis {
  prefix: Affix | null;
  prefixText: string | null;
  suffix: Affix | null;
  suffixText: string | null;
  root: string | null;
  hasAny: boolean;
}

/** Dò tiền tố + hậu tố của một từ (heuristic, mang tính gợi ý). */
export function analyzeWord(word: string): WordAnalysis {
  const lower = word.trim().toLowerCase();
  const empty: WordAnalysis = {
    prefix: null,
    prefixText: null,
    suffix: null,
    suffixText: null,
    root: null,
    hasAny: false,
  };
  if (lower.length < 4) return empty;

  // Hậu tố: chọn biến thể khớp dài nhất, đảm bảo gốc còn đủ dài
  let suffix: Affix | null = null;
  let suffixText: string | null = null;
  for (const affix of SUFFIX_DATA) {
    if (!affix.detect) continue;
    for (const form of affix.forms) {
      if (lower.endsWith(form) && lower.length - form.length >= MIN_ROOT) {
        if (!suffixText || form.length > suffixText.length) {
          suffix = affix;
          suffixText = form;
        }
      }
    }
  }

  // Tiền tố: trừ thêm phần hậu tố đã lấy để gốc vẫn đủ dài.
  // Bỏ qua nếu từ nằm trong danh sách "bạn giả".
  const suffixLen = suffixText?.length ?? 0;
  let prefix: Affix | null = null;
  let prefixText: string | null = null;
  for (const affix of PREFIX_FALSE_FRIENDS.has(lower) ? [] : PREFIX_DATA) {
    if (!affix.detect) continue;
    for (const form of affix.forms) {
      if (
        lower.startsWith(form) &&
        lower.length - form.length - suffixLen >= MIN_ROOT
      ) {
        if (!prefixText || form.length > prefixText.length) {
          prefix = affix;
          prefixText = form;
        }
      }
    }
  }

  const start = prefixText?.length ?? 0;
  const end = word.length - (suffixText?.length ?? 0);
  const root = start < end ? word.slice(start, end) : null;

  return {
    prefix,
    prefixText,
    suffix,
    suffixText,
    root,
    hasAny: !!(prefix || suffix),
  };
}
