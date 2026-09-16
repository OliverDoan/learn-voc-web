import { levenshtein } from "@/lib/utils";
import type { Card } from "@/lib/types";

/** Số từ tối thiểu của câu tiếng Anh để đáng làm bài viết lại câu. */
export const MIN_SENTENCE_WORDS = 3;

/** Tỉ lệ ký tự được phép sai (lỗi gõ nhẹ) so với độ dài câu đáp án. */
const TYPO_RATIO = 0.05;
/** Khoảng dung sai tối thiểu / tối đa (số ký tự) cho mức "gần đúng". */
const MIN_TOLERANCE = 1;
const MAX_TOLERANCE = 3;

export interface SentenceWriting {
  /** Câu tiếng Việt làm đề bài */
  prompt: string;
  /** Câu tiếng Anh đúng (đáp án) */
  answer: string;
  /** Từ vựng của thẻ — dùng làm gợi ý cấp 1 */
  keyword: string;
  /** Nghĩa tiếng Việt của từ vựng */
  meaning: string;
}

/**
 * Chuẩn hoá câu để so khớp: bỏ dấu câu, hạ chữ thường, gộp khoảng trắng.
 * Giữ lại nháy đơn để phân biệt dạng rút gọn (it's, don't).
 */
export function normalizeSentence(raw: string): string {
  return raw
    .normalize("NFC")
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\p{L}\p{N}'\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Tách câu thành mảng từ đã chuẩn hoá. */
export function tokenizeSentence(raw: string): string[] {
  const normalized = normalizeSentence(raw);
  return normalized ? normalized.split(" ") : [];
}

/**
 * Dựng đề bài "viết lại câu" từ câu ví dụ của thẻ.
 * Trả `null` nếu thẻ thiếu câu ví dụ, thiếu bản dịch, hoặc câu quá ngắn.
 */
export function buildSentenceWriting(card: Card): SentenceWriting | null {
  const answer = card.example?.trim();
  const prompt = card.exampleTranslation?.trim();
  if (!answer || !prompt) return null;
  if (tokenizeSentence(answer).length < MIN_SENTENCE_WORDS) return null;

  return {
    prompt,
    answer,
    keyword: card.word.trim(),
    meaning: card.meaning.trim(),
  };
}

/** Lọc các thẻ đủ điều kiện làm bài viết lại câu. */
export function sentenceWritingEligibleCards(cards: readonly Card[]): Card[] {
  return cards.filter((c) => buildSentenceWriting(c) !== null);
}

/** Số ký tự sai tối đa vẫn được tính "gần đúng" với một câu đáp án. */
export function sentenceTolerance(answer: string): number {
  const length = normalizeSentence(answer).length;
  const raw = Math.round(length * TYPO_RATIO);
  return Math.min(MAX_TOLERANCE, Math.max(MIN_TOLERANCE, raw));
}

/** "correct" = khớp hoàn toàn, "close" = chỉ sai chính tả nhẹ, "wrong" = sai. */
export type SentenceGrade = "correct" | "close" | "wrong";

/**
 * Chấm câu người dùng gõ so với đáp án.
 * Sai/thiếu/thừa nguyên một từ luôn bị tính là "wrong" (dù khoảng cách nhỏ),
 * chỉ lỗi gõ trong phạm vi cùng số từ mới được coi là "gần đúng".
 */
export function gradeSentence(input: string, answer: string): SentenceGrade {
  const got = normalizeSentence(input);
  const want = normalizeSentence(answer);
  if (!got || !want) return "wrong";
  if (got === want) return "correct";

  const gotWords = got.split(" ");
  const wantWords = want.split(" ");
  if (gotWords.length !== wantWords.length) return "wrong";

  const distance = levenshtein(got, want);
  return distance <= sentenceTolerance(answer) ? "close" : "wrong";
}

export type SentenceDiffType = "same" | "missing" | "extra";

export interface SentenceDiffPart {
  /** same = đúng, missing = thiếu so với đáp án, extra = người dùng gõ thừa. */
  type: SentenceDiffType;
  text: string;
}

interface RawToken {
  raw: string;
  key: string;
}

function rawTokens(raw: string): RawToken[] {
  return raw
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => ({ raw: token, key: normalizeSentence(token) }))
    .filter((t) => t.key.length > 0);
}

/**
 * So sánh câu người dùng gõ với đáp án ở mức TỪ (LCS) để highlight chỗ sai.
 * Kết quả đọc theo thứ tự đáp án; từ thừa được chèn ngay vị trí người dùng gõ.
 */
export function diffSentence(input: string, answer: string): SentenceDiffPart[] {
  const got = rawTokens(input);
  const want = rawTokens(answer);
  const m = got.length;
  const n = want.length;

  // dp[i][j] = độ dài LCS của got[i..] và want[j..]
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] =
        got[i].key === want[j].key
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const parts: SentenceDiffPart[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (got[i].key === want[j].key) {
      parts.push({ type: "same", text: want[j].raw });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      parts.push({ type: "extra", text: got[i].raw });
      i++;
    } else {
      parts.push({ type: "missing", text: want[j].raw });
      j++;
    }
  }
  while (i < m) parts.push({ type: "extra", text: got[i++].raw });
  while (j < n) parts.push({ type: "missing", text: want[j++].raw });

  return parts;
}

/**
 * Gợi ý khung câu: cấp 0 không hiện gì, cấp ≥1 hiện chữ cái đầu mỗi từ,
 * phần còn lại thay bằng dấu gạch dưới (giữ nguyên số ký tự).
 */
export function sentenceHint(answer: string, level: number): string {
  if (level < 1) return "";
  return answer
    .trim()
    .split(/\s+/)
    .map((word) => {
      const letters = word.replace(/[^\p{L}\p{N}']/gu, "");
      if (letters.length <= 1) return letters || word;
      return letters[0] + "_".repeat(letters.length - 1);
    })
    .filter(Boolean)
    .join(" ");
}
