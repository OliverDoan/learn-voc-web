import type { Card } from "@/lib/types";

/**
 * Logic thuần cho module học tiếng Trung.
 *
 * Deck được tách theo trường `language`: deck tiếng Anh ("en") giữ nguyên luồng cũ,
 * deck tiếng Trung ("zh") đi theo luồng riêng ở `/chinese` — không dùng SRS,
 * không tính vào điều kiện mở khóa Unit của phần tiếng Anh.
 *
 * Quy ước map dữ liệu tiếng Trung vào model `Card`:
 *   word = Hán tự · phonetic = pinyin · meaning = nghĩa tiếng Việt
 *   hanziFormal = chữ số đại tả (大写) · strokeCount = số nét · radical = bộ thủ
 */

export const DECK_LANGUAGES = ["en", "zh"] as const;
export type DeckLanguage = (typeof DECK_LANGUAGES)[number];

export const DEFAULT_DECK_LANGUAGE: DeckLanguage = "en";
export const CHINESE_DECK_LANGUAGE: DeckLanguage = "zh";

/** Mã giọng đọc tiếng Trung phổ thông cho Web Speech API. */
export const CHINESE_TTS_LANG = "zh-CN";

/** Chuẩn hoá tham số ngôn ngữ (query string, form...); giá trị lạ → "en". */
export function parseDeckLanguage(
  value: string | null | undefined,
): DeckLanguage {
  return DECK_LANGUAGES.includes(value as DeckLanguage)
    ? (value as DeckLanguage)
    : DEFAULT_DECK_LANGUAGE;
}

export function isChineseDeck(deck: { language?: string | null }): boolean {
  return deck.language === CHINESE_DECK_LANGUAGE;
}

/** Số bài từ tên deck theo giáo trình ("Bài 12: ..." → 12); không theo mẫu → null. */
export function chineseLessonNumber(name: string): number | null {
  const match = /^\s*Bài\s+(\d+)/i.exec(name);
  return match ? Number(match[1]) : null;
}

/** Xếp deck theo số bài tăng dần; deck không có số bài đứng cuối, giữ thứ tự cũ. */
export function sortChineseDecks<T extends { name: string }>(decks: readonly T[]): T[] {
  const rank = (deck: T) => chineseLessonNumber(deck.name) ?? Number.POSITIVE_INFINITY;
  return [...decks].sort((a, b) => rank(a) - rank(b));
}

/** Điều kiện Prisma cho các trang tổng hợp tiếng Anh: chỉ deck `language = "en"`. */
export const ENGLISH_DECK_FILTER = { language: DEFAULT_DECK_LANGUAGE } as const;

/** Điều kiện Prisma trên `Card`/`Story`: chỉ thuộc deck tiếng Anh. */
export const ENGLISH_DECK_RELATION_FILTER = {
  deck: { language: DEFAULT_DECK_LANGUAGE },
} as const;

/** Gộp số nét + bộ thủ thành một dòng hiển thị, vd "5 nét · bộ 囗". */
export function strokeSummary(card: {
  strokeCount?: number | null;
  radical?: string | null;
}): string | null {
  const parts: string[] = [];
  if (typeof card.strokeCount === "number" && card.strokeCount > 0) {
    parts.push(`${card.strokeCount} nét`);
  }
  const radical = card.radical?.trim();
  if (radical) parts.push(`bộ ${radical}`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export type ChineseQuizMode =
  "hanzi-to-meaning" | "meaning-to-hanzi" | "hanzi-to-pinyin";

export const CHINESE_QUIZ_MODES: readonly ChineseQuizMode[] = [
  "hanzi-to-meaning",
  "meaning-to-hanzi",
  "hanzi-to-pinyin",
];

/** Câu hỏi hiển thị theo từng dạng. */
export const CHINESE_QUIZ_PROMPTS: Record<ChineseQuizMode, string> = {
  "hanzi-to-meaning": "Chữ này nghĩa là gì?",
  "meaning-to-hanzi": "Chữ Hán nào mang nghĩa này?",
  "hanzi-to-pinyin": "Pinyin của chữ này là gì?",
};

export interface ChineseQuizQuestion {
  cardId: string;
  mode: ChineseQuizMode;
  /** Nội dung đề bài (Hán tự hoặc nghĩa tiếng Việt) */
  prompt: string;
  /** Pinyin hiện kèm đề — chỉ khi pinyin không phải đáp án cần đoán */
  promptPinyin: string | null;
  /** Hán tự cần đọc to (null nếu đề không phải Hán tự) */
  speakText: string | null;
  answer: string;
  /** Các lựa chọn đã trộn, luôn chứa `answer`, không trùng nhau */
  options: string[];
}

export interface BuildChineseQuizOptions {
  /** Các dạng câu hỏi, xoay vòng theo thứ tự khai báo */
  modes?: readonly ChineseQuizMode[];
  /** Nguồn lấy đáp án nhiễu (mặc định là chính `cards`) */
  pool?: readonly Card[];
  /** Số lựa chọn mỗi câu (tối đa, thiếu thẻ thì ít hơn) */
  optionCount?: number;
  /** Bộ sinh số ngẫu nhiên — truyền vào để test ổn định */
  rng?: () => number;
}

/** Giá trị đóng vai đáp án của một thẻ ứng với dạng câu hỏi. */
function answerOf(card: Card, mode: ChineseQuizMode): string | null {
  const value =
    mode === "meaning-to-hanzi"
      ? card.word
      : mode === "hanzi-to-pinyin"
        ? card.phonetic
        : card.meaning;
  return value?.trim() || null;
}

/** Giá trị đóng vai đề bài của một thẻ ứng với dạng câu hỏi. */
function promptOf(card: Card, mode: ChineseQuizMode): string | null {
  const value = mode === "meaning-to-hanzi" ? card.meaning : card.word;
  return value?.trim() || null;
}

/** Fisher-Yates, trả về mảng mới (không đụng mảng gốc). */
function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Tạo bộ câu hỏi trắc nghiệm cho một deck tiếng Trung.
 * Mỗi thẻ ra đúng một câu; thẻ thiếu dữ liệu cho dạng câu hỏi tương ứng sẽ bị bỏ qua.
 */
export function buildChineseQuiz(
  cards: readonly Card[],
  options: BuildChineseQuizOptions = {},
): ChineseQuizQuestion[] {
  const {
    modes = CHINESE_QUIZ_MODES,
    pool = cards,
    optionCount = 4,
    rng = Math.random,
  } = options;
  if (modes.length === 0) return [];

  const questions: ChineseQuizQuestion[] = [];

  cards.forEach((card, index) => {
    const mode = modes[index % modes.length];
    const prompt = promptOf(card, mode);
    const answer = answerOf(card, mode);
    if (!prompt || !answer) return;

    // Đáp án nhiễu: giá trị cùng loại từ các thẻ khác, bỏ trùng đáp án đúng.
    const distractors = new Set<string>();
    for (const other of pool) {
      if (other.id === card.id) continue;
      // Thẻ cùng đề bài (vd 二 và 两 cùng nghĩa "hai") cũng là đáp án đúng → không làm nhiễu.
      if (promptOf(other, mode) === prompt) continue;
      const value = answerOf(other, mode);
      if (value && value !== answer) distractors.add(value);
    }

    const picked = shuffle([...distractors], rng).slice(
      0,
      Math.max(0, optionCount - 1),
    );
    const pinyin = card.phonetic?.trim() || null;

    questions.push({
      cardId: card.id,
      mode,
      prompt,
      promptPinyin: mode === "hanzi-to-meaning" ? pinyin : null,
      speakText: mode === "meaning-to-hanzi" ? null : card.word.trim() || null,
      answer,
      options: shuffle([answer, ...picked], rng),
    });
  });

  return questions;
}
