/**
 * Thẻ đang hiện từ tiếng Anh hay không — dùng để tự phát âm đúng lúc.
 * Anh→Việt: từ ở mặt trước. Việt→Anh (reverse): từ chỉ lộ ra sau khi lật.
 */
export function isEnglishFaceShown({ reverse, flipped }: { reverse: boolean; flipped: boolean }): boolean {
  return reverse === flipped;
}
