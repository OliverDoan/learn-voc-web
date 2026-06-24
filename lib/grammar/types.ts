// Mô hình dữ liệu cho chức năng học ngữ pháp (nội dung tĩnh, không cần DB).

export type GrammarLevel = "A" | "B" | "C";

export interface GrammarExample {
  en: string;
  vi: string;
}

export interface GrammarRule {
  title: string;
  explanation: string;
  /** Công thức/cấu trúc ngắn gọn, hiển thị nổi bật (vd: "S + V(s/es) + O"). */
  formula?: string;
  examples: GrammarExample[];
}

/** Bảng tổng hợp: tiêu đề cột + các hàng dữ liệu. */
export interface GrammarTable {
  caption?: string;
  headers: string[];
  rows: string[][];
}

/** Bài tập trắc nghiệm: chọn 1 đáp án đúng trong options. */
export interface GrammarMcExercise {
  id: string;
  type: "mc";
  prompt: string;
  options: string[];
  answer: string; // phải trùng 1 phần tử trong options
  explanation: string;
}

/** Bài tập điền từ: gõ đáp án; accept là các biến thể cũng được chấp nhận. */
export interface GrammarFillExercise {
  id: string;
  type: "fill";
  prompt: string;
  answer: string;
  accept?: string[];
  explanation: string;
}

export type GrammarExercise = GrammarMcExercise | GrammarFillExercise;

export interface GrammarTopic {
  id: string;
  level: GrammarLevel;
  name: string; // tên tiếng Anh
  nameVi: string;
  icon: string; // emoji
  summary: string;
  rules: GrammarRule[];
  /** Bảng tổng hợp (tuỳ chọn) — hiển thị sau phần lý thuyết. */
  tables?: GrammarTable[];
  commonMistakes?: string[];
  exercises?: GrammarExercise[];
}

export const GRAMMAR_LEVEL_LABEL: Record<GrammarLevel, string> = {
  A: "Cơ bản (A1–A2)",
  B: "Trung cấp (B1–B2)",
  C: "Nâng cao (C1)",
};

export const GRAMMAR_LEVEL_ORDER: readonly GrammarLevel[] = ["A", "B", "C"];

/** So khớp đáp án bài điền từ: không phân biệt hoa thường, bỏ khoảng trắng thừa. */
export function isFillCorrect(exercise: GrammarFillExercise, attempt: string): boolean {
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const a = norm(attempt);
  if (!a) return false;
  return [exercise.answer, ...(exercise.accept ?? [])].some((x) => norm(x) === a);
}
