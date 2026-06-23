import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Trả về chuỗi "Từ gốc" để hiển thị, hoặc null nếu từ gốc chính là từ đó
 * (vd word="journey", rootWord="journey (n/v)" → ẩn cho gọn).
 * So sánh phần từ trước dấu ngoặc, không phân biệt hoa thường.
 */
export function displayRootWord(
  word: string,
  rootWord: string | null | undefined,
): string | null {
  if (!rootWord) return null;
  const base = rootWord.replace(/\s*\([^)]*\)\s*$/, "").trim().toLowerCase();
  if (base === word.trim().toLowerCase()) return null;
  return rootWord;
}

/**
 * Lớp màu cho badge "từ loại" (part of speech): danh/động/tính/trạng từ mỗi loại 1 màu.
 * Khớp linh hoạt: "n"/"noun", "v"/"verb", "adj"/"adjective", "adv"/"adverb".
 */
export function posBadgeClass(pos: string | null | undefined): string {
  const p = (pos ?? "").trim().toLowerCase();
  if (/^adv/.test(p)) return "border-violet-400/40 bg-violet-400/10 text-violet-600 dark:text-violet-300";
  if (/^adj/.test(p)) return "border-amber-400/40 bg-amber-400/10 text-amber-600 dark:text-amber-300";
  if (/^n/.test(p)) return "border-blue-400/40 bg-blue-400/10 text-blue-600 dark:text-blue-300";
  if (/^v/.test(p)) return "border-emerald-400/40 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300";
  return "border-border text-muted-foreground";
}

export function parseTags(tagsJson: string | null | undefined): string[] {
  if (!tagsJson) return [];
  try {
    const parsed = JSON.parse(tagsJson);
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}

export function stringifyTags(tags: readonly string[]): string {
  return JSON.stringify(tags);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}
