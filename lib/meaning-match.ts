import { levenshtein } from "@/lib/utils";

/**
 * So khớp câu trả lời tiếng Việt với nghĩa của thẻ.
 *
 * Nghĩa trong thẻ thường gộp nhiều nghĩa hoặc nhiều cách diễn đạt:
 *   "tức giận; điên rồ" · "tàn nhẫn, độc ác" · "phát triển (tính cách, mối quan hệ)"
 * Người học gõ đúng MỘT trong số đó thì vẫn tính đúng.
 */

/** Chuẩn hoá: bỏ khoảng trắng thừa, dấu câu ở hai đầu, đưa về chữ thường. */
function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/^[.,;/\s]+|[.,;/\s]+$/g, "");
}

/** Bỏ mọi cụm trong ngoặc đơn, vd "phát triển (tính cách)" → "phát triển". */
function stripParentheses(text: string): string {
  return text.replace(/\([^)]*\)/g, " ");
}

/** Tách theo các dấu ngăn cách nhưng BỎ QUA dấu nằm trong ngoặc đơn. */
function splitOutsideParentheses(text: string, separators: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let buffer = "";

  for (const ch of text) {
    if (ch === "(") depth += 1;
    else if (ch === ")") depth = Math.max(0, depth - 1);

    if (depth === 0 && separators.includes(ch)) {
      parts.push(buffer);
      buffer = "";
      continue;
    }
    buffer += ch;
  }
  parts.push(buffer);
  return parts;
}

/**
 * Các đáp án được chấp nhận cho một chuỗi nghĩa, theo thứ tự:
 * chuỗi đầy đủ → từng nghĩa (tách bởi `;`) → từng cách diễn đạt (tách bởi `,` `/`).
 * Mỗi biến thể có thêm bản đã bỏ phần trong ngoặc. Không trùng lặp.
 */
export function meaningVariants(meaning: string): string[] {
  const full = normalize(meaning);
  if (!full) return [];

  const out = new Set<string>([full]);

  const addVariant = (raw: string) => {
    const value = normalize(raw);
    if (value) out.add(value);
    const bare = normalize(stripParentheses(raw));
    if (bare) out.add(bare);
  };

  addVariant(stripParentheses(full));

  for (const sense of splitOutsideParentheses(full, ";")) {
    addVariant(sense);
    for (const phrasing of splitOutsideParentheses(sense, ",/")) {
      addVariant(phrasing);
    }
  }

  return [...out];
}

/**
 * Sai số Levenshtein cho phép của một biến thể — cố tình rất chặt:
 * - nghĩa ngắn ("lớp", "điểm", "trống") phải gõ đúng hẳn, nếu không nó khớp bừa
 *   với gần như mọi câu trả lời ngắn ("trống" chỉ cách "trồng" 1 phép sửa);
 * - nghĩa dài hơn được bỏ qua 1 ký tự (lỗi gõ, thiếu dấu).
 * Nới rộng hơn là nguy hiểm với tiếng Việt: "phong cách" chỉ cách "khoảng cách"
 * đúng 2 phép sửa nhưng khác nghĩa hoàn toàn.
 */
function toleranceFor(variant: string): number {
  return variant.length <= 5 ? 0 : 1;
}

/**
 * Câu trả lời có khớp nghĩa của thẻ không? Đúng khi khớp (gần đúng) với bất kỳ
 * biến thể nào — trừ những biến thể quá ngắn để tránh khớp nhầm một mẩu nghĩa.
 */
export function matchesMeaning(input: string, meaning: string): boolean {
  const answer = normalize(input);
  if (!answer) return false;

  return meaningVariants(meaning).some(
    (variant) => levenshtein(answer, variant) <= toleranceFor(variant),
  );
}
