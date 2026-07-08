// Dữ liệu "Xem lỗi sai" — chỉnh sửa trực tiếp mảng MISTAKES bên dưới.
// answer = null nghĩa là "(không trả lời)".

export type MistakeType =
  | "Từ loại"
  | "Chính tả"
  | "Thiếu từ loại"
  | "Thiếu từ"
  | "Nhớ nhầm"
  | "Quên từ";

export interface MistakeRow {
  unit: string; // vd "Unit 1"
  type: MistakeType;
  answer: string | null; // null = không trả lời
  correct: string;
}

export const MISTAKES: MistakeRow[] = [
  { unit: "Unit 1", type: "Từ loại", answer: "abroad (n)", correct: "abroad (adv)" },
  { unit: "Unit 1", type: "Từ loại", answer: "skill (v)", correct: "skill (n)" },
  { unit: "Unit 1", type: "Từ loại", answer: "communicate (n)", correct: "communicate (v)" },
  { unit: "Unit 1", type: "Từ loại", answer: "confident (n)", correct: "confident (adj)" },

  { unit: "Unit 2", type: "Chính tả", answer: "kinderganter", correct: "kindergarten" },
  { unit: "Unit 2", type: "Chính tả", answer: "Mathematis", correct: "mathematics" },
  { unit: "Unit 2", type: "Từ loại", answer: "absent (v)", correct: "absent (adj)" },
  { unit: "Unit 2", type: "Từ loại", answer: "popular (n)", correct: "popular (adj)" },
  { unit: "Unit 2", type: "Từ loại", answer: "continue (adv)", correct: "continue (v)" },
  { unit: "Unit 2", type: "Thiếu từ loại", answer: "drop out", correct: "drop out (v.phr)" },
  { unit: "Unit 2", type: "Thiếu từ", answer: null, correct: "live (v)" },

  { unit: "Unit 3", type: "Từ loại", answer: "special (adv)", correct: "special (adj)" },
  { unit: "Unit 3", type: "Từ loại", answer: "common (n)", correct: "common (adj)" },
  { unit: "Unit 3", type: "Từ loại", answer: "favourite (n)", correct: "favourite (adj)" },
  { unit: "Unit 3", type: "Nhớ nhầm", answer: "fullname", correct: "surname" },

  { unit: "Unit 4", type: "Nhớ nhầm", answer: "job", correct: "assistant" },
  { unit: "Unit 4", type: "Nhớ nhầm", answer: "deal", correct: "offer" },
  { unit: "Unit 4", type: "Nhớ nhầm", answer: "changing", correct: "challenging" },
  { unit: "Unit 4", type: "Nhớ nhầm", answer: "cooker", correct: "cook" },
  { unit: "Unit 4", type: "Quên từ", answer: "bank teller", correct: "accountant" },
  { unit: "Unit 4", type: "Chính tả", answer: "puntcanble", correct: "punctual" },

  { unit: "Unit 5", type: "Từ loại", answer: "jobless (n)", correct: "jobless (adj)" },
  { unit: "Unit 5", type: "Chính tả", answer: "applycation", correct: "application" },
  { unit: "Unit 5", type: "Nhớ nhầm", answer: "secrity", correct: "secretary" },
  { unit: "Unit 5", type: "Nhớ nhầm", answer: "photography", correct: "photographer" },
  { unit: "Unit 5", type: "Từ loại", answer: "qualify (adj)", correct: "qualified (adj)" },
  { unit: "Unit 5", type: "Nhớ nhầm", answer: "freelance", correct: "freelancer" },
  { unit: "Unit 5", type: "Thiếu từ", answer: null, correct: "prepare (v)" },
  { unit: "Unit 5", type: "Thiếu từ", answer: null, correct: "file (n)" },
  { unit: "Unit 5", type: "Thiếu từ", answer: null, correct: "reporter (n)" },
  { unit: "Unit 5", type: "Thiếu từ", answer: null, correct: "designer (n)" },
  { unit: "Unit 5", type: "Thiếu từ", answer: null, correct: "expert (n)" },
  { unit: "Unit 5", type: "Thiếu từ", answer: null, correct: "employed (adj)" },
  { unit: "Unit 5", type: "Thiếu từ", answer: null, correct: "contract (n)" },

  { unit: "Unit 6", type: "Từ loại", answer: "luxury (adj)", correct: "luxury (n)" },
  { unit: "Unit 6", type: "Từ loại", answer: "broke (n)", correct: "broke (adj)" },
  { unit: "Unit 6", type: "Từ loại", answer: "raise (v)", correct: "raise (n)" },
  { unit: "Unit 6", type: "Nhớ nhầm", answer: "lent (v)", correct: "lend (v)" },
  { unit: "Unit 6", type: "Nhớ nhầm", answer: "own (n)", correct: "owe (v)" },
  { unit: "Unit 6", type: "Thiếu từ", answer: null, correct: "spend (v)" },
  { unit: "Unit 6", type: "Thiếu từ", answer: null, correct: "bill (n)" },
  { unit: "Unit 6", type: "Thiếu từ", answer: null, correct: "due (adj)" },
  { unit: "Unit 6", type: "Thiếu từ", answer: null, correct: "rent (n)" },

  { unit: "Unit 7", type: "Chính tả", answer: "skycraper", correct: "skyscraper" },
  { unit: "Unit 7", type: "Từ loại", answer: "central (n)", correct: "central (adj)" },
  { unit: "Unit 7", type: "Thiếu từ", answer: null, correct: "neighbourhood (n)" },
  { unit: "Unit 7", type: "Chính tả", answer: "convient", correct: "convenient" },
  { unit: "Unit 7", type: "Nhớ nhầm", answer: "nightlight", correct: "nightlife" },
  { unit: "Unit 7", type: "Chính tả", answer: "opportunite", correct: "opportunity" },

  { unit: "Unit 8", type: "Từ loại", answer: "pricey (n)", correct: "pricey (adj)" },
  { unit: "Unit 8", type: "Thiếu từ", answer: null, correct: "accommodation (n)" },
  { unit: "Unit 8", type: "Chính tả", answer: "populution", correct: "pollution" },
  { unit: "Unit 8", type: "Nhớ nhầm", answer: "trash", correct: "rubbish" },
  { unit: "Unit 8", type: "Từ loại", answer: "overpopulation (n)", correct: "overpopulated (adj)" },
  { unit: "Unit 8", type: "Chính tả", answer: "facitily", correct: "facility" },
  { unit: "Unit 8", type: "Thiếu từ", answer: null, correct: "lack (v)" },
  { unit: "Unit 8", type: "Thiếu từ", answer: null, correct: "build (v)" },
  { unit: "Unit 8", type: "Thiếu từ", answer: null, correct: "beggar (n)" },
  { unit: "Unit 8", type: "Chính tả", answer: "pickpocet", correct: "pickpocket" },
  { unit: "Unit 8", type: "Thiếu từ", answer: null, correct: "crime (n)" },
  { unit: "Unit 8", type: "Nhớ nhầm", answer: "afffor / admend", correct: "affordable (adj)" },
  { unit: "Unit 8", type: "Thiếu từ", answer: null, correct: "demand (n)" },
];

/** Màu hex theo loại lỗi (dùng cho biểu đồ). */
export const MISTAKE_TYPE_COLOR: Record<MistakeType, string> = {
  "Từ loại": "#3b82f6",
  "Chính tả": "#f59e0b",
  "Thiếu từ loại": "#8b5cf6",
  "Thiếu từ": "#64748b",
  "Nhớ nhầm": "#f43f5e",
  "Quên từ": "#f97316",
};

/** Màu badge theo loại lỗi. */
export function mistakeTypeClass(type: MistakeType): string {
  switch (type) {
    case "Từ loại":
      return "border-blue-400/40 bg-blue-400/10 text-blue-600 dark:text-blue-300";
    case "Chính tả":
      return "border-amber-400/40 bg-amber-400/10 text-amber-600 dark:text-amber-300";
    case "Thiếu từ loại":
      return "border-violet-400/40 bg-violet-400/10 text-violet-600 dark:text-violet-300";
    case "Thiếu từ":
      return "border-slate-400/40 bg-slate-400/10 text-slate-600 dark:text-slate-300";
    case "Nhớ nhầm":
      return "border-rose-400/40 bg-rose-400/10 text-rose-600 dark:text-rose-300";
    case "Quên từ":
      return "border-orange-400/40 bg-orange-400/10 text-orange-600 dark:text-orange-300";
    default:
      return "border-border text-muted-foreground";
  }
}
