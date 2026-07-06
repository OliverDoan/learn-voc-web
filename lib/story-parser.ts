export type StoryToken =
  | { type: "text"; text: string }
  | { type: "word"; word: string; meaning: string };

const TOKEN_RE = /\[\[([^|\]]+)\|([^\]]+)\]\]/g;

export function parseStory(content: string): StoryToken[] {
  const tokens: StoryToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(content)) !== null) {
    const [full, word, meaning] = match;
    if (match.index > lastIndex) {
      tokens.push({ type: "text", text: content.slice(lastIndex, match.index) });
    }
    tokens.push({ type: "word", word: word.trim(), meaning: meaning.trim() });
    lastIndex = match.index + full.length;
  }
  if (lastIndex < content.length) {
    tokens.push({ type: "text", text: content.slice(lastIndex) });
  }
  return tokens;
}

export function extractWords(content: string): Array<{ word: string; meaning: string }> {
  return parseStory(content)
    .filter((t): t is Extract<StoryToken, { type: "word" }> => t.type === "word")
    .map(({ word, meaning }) => ({ word, meaning }));
}

export function countWordTokens(content: string): number {
  return extractWords(content).length;
}

export function maskWords(content: string, placeholder = "_____"): string {
  return content.replace(TOKEN_RE, placeholder);
}

export function plainText(content: string): string {
  return content.replace(TOKEN_RE, (_m, word) => word);
}

/**
 * Lấy nghĩa đầu tiên khi một từ có nhiều nghĩa tiếng Việt.
 * Tách theo dấu phẩy / chấm phẩy / gạch chéo / xuống dòng / dấu phẩy tiếng Nhật.
 * Ví dụ: "đi làm, đi lại" → "đi làm".
 */
export function firstMeaning(meaning: string): string {
  const first = meaning.split(/[,;/\n、]/)[0]?.trim();
  return first || meaning.trim();
}

/**
 * Dựng bản đọc toàn bộ tiếng Việt từ nội dung chêm: thay mỗi [[word|nghĩa]]
 * bằng nghĩa tiếng Việt (nghĩa đầu tiên cho gọn). Văn nền vốn đã là tiếng Việt.
 */
export function toVietnamese(content: string): string {
  return content.replace(TOKEN_RE, (_m, _word, meaning) => firstMeaning(meaning));
}
