"use client";

// Web Speech Recognition API chưa có sẵn trong lib.dom ở nhiều cấu hình TS,
// nên khai báo tối thiểu các kiểu cần dùng ở đây.

export interface SpeechRecognitionAlt {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultLike {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: SpeechRecognitionAlt;
}

interface SpeechRecognitionResultListLike {
  readonly length: number;
  [index: number]: SpeechRecognitionResultLike;
}

export interface SpeechRecognitionEventLike extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultListLike;
}

export interface SpeechRecognitionErrorEventLike extends Event {
  readonly error: string;
  readonly message: string;
}

export interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

interface SpeechWindow extends Window {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
}

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as SpeechWindow;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getCtor() !== null;
}

export function createRecognition(lang = "en-US"): SpeechRecognitionInstance | null {
  const Ctor = getCtor();
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 5;
  return recognition;
}

/**
 * Chuẩn hoá để so khớp: bỏ khoảng trắng thừa, dấu câu, đưa về chữ thường.
 * Dùng cho chế độ chấm "chính xác tuyệt đối" (so sau khi chuẩn hoá cơ bản).
 */
export function normalizeForCompare(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:"'’]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Chấm chính xác tuyệt đối: ít nhất một phương án nhận dạng (alternative)
 * trùng khớp hoàn toàn với từ đích sau khi chuẩn hoá.
 */
export function isExactMatch(target: string, alternatives: readonly string[]): boolean {
  const normalizedTarget = normalizeForCompare(target);
  return alternatives.some((alt) => normalizeForCompare(alt) === normalizedTarget);
}

/**
 * Khoảng cách Levenshtein (số phép chèn/xoá/thay tối thiểu) giữa hai chuỗi.
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Chỉ giữ hai hàng của ma trận để tiết kiệm bộ nhớ.
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1, // chèn
        prev[j] + 1, // xoá
        prev[j - 1] + cost, // thay
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[b.length];
}

/**
 * Độ tương đồng 0..1 giữa hai chuỗi (1 = giống hệt) dựa trên Levenshtein.
 */
export function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

/**
 * Ngưỡng độ tương đồng để coi là phát âm "đạt". Càng thấp càng dễ.
 * 0.6 = chấp nhận phát âm gần đúng (sai ~40% ký tự vẫn qua).
 */
export const DEFAULT_MATCH_THRESHOLD = 0.6;

/**
 * Từ ngưỡng này trở lên coi là chế độ "nghiêm ngặt": chỉ xét phương án nhận
 * dạng tốt nhất và so cả cụm, KHÔNG chấp nhận kiểu "nói dư chữ" (khớp token con).
 */
export const STRICT_MATCH_THRESHOLD = 0.9;

/**
 * Chấm phát âm. Độ khoan dung phụ thuộc `threshold`:
 *
 * - Thường (threshold < 0.9): đạt nếu BẤT KỲ phương án nhận dạng nào trùng khớp
 *   tuyệt đối, chứa từ đích như một token riêng (nói dư chữ), hoặc có độ tương
 *   đồng >= threshold (so cả câu lẫn từng token).
 * - Nghiêm ngặt (threshold >= 0.9): CHỈ xét phương án tốt nhất và so nguyên cụm —
 *   phải trùng tuyệt đối hoặc tương đồng >= threshold. Không chấp nhận từ đích chỉ
 *   là một token trong câu dài, cũng không "vớt" từ các phương án xếp sau. Nhờ vậy
 *   đọc sai sẽ không bị báo đúng chỉ vì máy đề xuất đúng ở đâu đó.
 *
 * Trả về độ tương đồng tốt nhất tìm được để hiển thị/ghi log nếu cần.
 */
export function matchPronunciation(
  target: string,
  alternatives: readonly string[],
  threshold = DEFAULT_MATCH_THRESHOLD,
): { matched: boolean; score: number } {
  const normalizedTarget = normalizeForCompare(target);
  if (!normalizedTarget) return { matched: false, score: 0 };

  const strict = threshold >= STRICT_MATCH_THRESHOLD;
  // Nghiêm ngặt: chỉ tin phương án xếp hạng cao nhất mà máy nghe được.
  const candidates = strict ? alternatives.slice(0, 1) : alternatives;

  let best = 0;
  for (const alt of candidates) {
    const normalizedAlt = normalizeForCompare(alt);
    if (!normalizedAlt) continue;

    // Khớp tuyệt đối cả cụm — luôn được chấp nhận.
    if (normalizedAlt === normalizedTarget) return { matched: true, score: 1 };

    if (!strict) {
      // Từ đích xuất hiện như một token trong câu nghe được (người dùng nói dư chữ).
      const tokens = normalizedAlt.split(" ");
      if (tokens.includes(normalizedTarget)) return { matched: true, score: 1 };
      for (const token of tokens) {
        best = Math.max(best, similarity(normalizedTarget, token));
      }
    }

    // So khớp với cả cụm.
    best = Math.max(best, similarity(normalizedTarget, normalizedAlt));
  }

  return { matched: best >= threshold, score: best };
}

/**
 * @deprecated Dùng {@link matchPronunciation} để chấm khoan dung hơn.
 * Giữ lại để tương thích: đạt nếu độ tương đồng vượt ngưỡng mặc định.
 */
export function isCloseMatch(target: string, alternatives: readonly string[]): boolean {
  return matchPronunciation(target, alternatives).matched;
}
