import { DEFAULT_MATCH_THRESHOLD } from "@/lib/speech-recognition";

/**
 * Độ khó chấm phát âm. Ngưỡng càng cao thì yêu cầu phát âm càng giống → càng khó.
 */
export type PronounceDifficulty = "easy" | "normal" | "hard" | "strict";

export const PRONOUNCE_DIFFICULTY_KEY = "voca-pronounce-difficulty";

interface DifficultyMeta {
  readonly level: PronounceDifficulty;
  readonly label: string;
  readonly description: string;
  readonly threshold: number;
}

/** Ngưỡng độ tương đồng (0..1) tương ứng từng mức độ khó. */
export const DIFFICULTY_OPTIONS: readonly DifficultyMeta[] = [
  {
    level: "easy",
    label: "Dễ",
    description: "Chấp nhận phát âm gần đúng, bỏ qua sai sót nhỏ.",
    threshold: 0.45,
  },
  {
    level: "normal",
    label: "Vừa",
    description: "Cân bằng — phù hợp luyện tập hằng ngày.",
    threshold: DEFAULT_MATCH_THRESHOLD, // 0.6
  },
  {
    level: "hard",
    label: "Khó",
    description: "Yêu cầu phát âm khá chính xác.",
    threshold: 0.8,
  },
  {
    level: "strict",
    label: "Nghiêm ngặt",
    description: "Gần như phải khớp tuyệt đối.",
    threshold: 0.95,
  },
];

const DEFAULT_DIFFICULTY: PronounceDifficulty = "normal";

function isDifficulty(value: unknown): value is PronounceDifficulty {
  return DIFFICULTY_OPTIONS.some((o) => o.level === value);
}

/** Đọc mức độ khó đã lưu (mặc định "normal"). An toàn khi chạy SSR. */
export function getPronounceDifficulty(): PronounceDifficulty {
  if (typeof window === "undefined") return DEFAULT_DIFFICULTY;
  const stored = window.localStorage.getItem(PRONOUNCE_DIFFICULTY_KEY);
  return isDifficulty(stored) ? stored : DEFAULT_DIFFICULTY;
}

/** Lưu mức độ khó vào localStorage. */
export function setPronounceDifficulty(level: PronounceDifficulty): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PRONOUNCE_DIFFICULTY_KEY, level);
}

/** Lấy ngưỡng độ tương đồng tương ứng một mức độ khó. */
export function thresholdForDifficulty(level: PronounceDifficulty): number {
  const meta = DIFFICULTY_OPTIONS.find((o) => o.level === level);
  return meta ? meta.threshold : DEFAULT_MATCH_THRESHOLD;
}
