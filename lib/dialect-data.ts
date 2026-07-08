// Biến thể tiếng Anh: Anh–Anh (British / BrE) ↔ Anh–Mỹ (American / AmE).
// Chỉ liệt kê những từ có KHÁC BIỆT rõ ràng (chính tả hoặc từ vựng).
// Từ dùng chung cả hai vùng để trống (dialect = null, không gắn badge).

export type Dialect = "british" | "american";

export interface DialectInfo {
  // Biến thể mà từ trong thẻ đang thuộc về
  dialect: Dialect;
  // Từ tương đương ở biến thể còn lại (vd centre → center)
  variant: string;
  // Loại khác biệt: chính tả hay từ vựng
  kind: "spelling" | "vocabulary";
}

// key = word viết thường (đã trim)
export const DIALECT_MAP: Record<string, DialectInfo> = {
  // --- Khác biệt chính tả (bộ từ đang dùng chính tả Anh–Anh) ---
  centre: { dialect: "british", variant: "center", kind: "spelling" },
  favourite: { dialect: "british", variant: "favorite", kind: "spelling" },
  travelling: { dialect: "british", variant: "traveling", kind: "spelling" },
  ageing: { dialect: "british", variant: "aging", kind: "spelling" },
  litre: { dialect: "british", variant: "liter", kind: "spelling" },
  memorise: { dialect: "british", variant: "memorize", kind: "spelling" },
  neighbourhood: { dialect: "british", variant: "neighborhood", kind: "spelling" },
  flavour: { dialect: "british", variant: "flavor", kind: "spelling" },
  savoury: { dialect: "british", variant: "savory", kind: "spelling" },
  cosy: { dialect: "british", variant: "cozy", kind: "spelling" },
  // "enroll" là chính tả Anh–Mỹ; Anh–Anh viết "enrol"
  enroll: { dialect: "american", variant: "enrol", kind: "spelling" },

  // --- Khác biệt từ vựng ---
  pavement: { dialect: "british", variant: "sidewalk", kind: "vocabulary" },
  flat: { dialect: "british", variant: "apartment", kind: "vocabulary" },
  rubbish: { dialect: "british", variant: "garbage / trash", kind: "vocabulary" },
  takeaway: { dialect: "british", variant: "takeout", kind: "vocabulary" },
};

/** Tra thông tin biến thể của một từ; trả về null nếu từ dùng chung cả hai vùng. */
export function lookupDialect(word: string): DialectInfo | null {
  return DIALECT_MAP[word.trim().toLowerCase()] ?? null;
}

// Nhãn hiển thị tiếng Việt cho từng biến thể
export const DIALECT_LABEL: Record<Dialect, string> = {
  british: "Anh–Anh",
  american: "Anh–Mỹ",
};

// Nhãn ngắn (cờ + viết tắt) cho badge
export const DIALECT_SHORT: Record<Dialect, string> = {
  british: "🇬🇧 BrE",
  american: "🇺🇸 AmE",
};

// Biến thể đối lập
export const OTHER_DIALECT: Record<Dialect, Dialect> = {
  british: "american",
  american: "british",
};
