"use client";

export function speak(text: string, lang = "en-US", rate = 0.95): void {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = rate;
  window.speechSynthesis.speak(utter);
}

/**
 * Đọc 1 đoạn text và trả Promise resolve khi đọc xong (hoặc lỗi/không hỗ trợ).
 * Không gọi cancel() để có thể phát tuần tự nhiều câu liên tiếp.
 */
export function speakAsync(text: string, lang = "en-US", rate = 0.95): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = rate;
    utter.onend = () => resolve();
    utter.onerror = () => resolve();
    window.speechSynthesis.speak(utter);
  });
}

/**
 * Đánh vần một từ: đọc lần lượt từng chữ cái (vd "apple" → a, p, p, l, e).
 * Chỉ đọc ký tự chữ/số, bỏ qua khoảng trắng và dấu câu.
 * `shouldCancel` cho phép dừng giữa chừng (dùng khi phát trong vòng lặp đọc tất cả).
 */
export async function spellAsync(
  word: string,
  lang = "en-US",
  rate = 0.8,
  shouldCancel?: () => boolean,
): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const letters = Array.from(word).filter((ch) => /[\p{L}\p{N}]/u.test(ch));
  for (const letter of letters) {
    if (shouldCancel?.()) return;
    await speakAsync(letter, lang, rate);
    if (shouldCancel?.()) return;
    await new Promise<void>((r) => setTimeout(r, 120));
  }
}

/** Dừng phát âm hiện tại rồi đánh vần từ (fire-and-forget cho nút bấm lẻ). */
export async function spell(word: string, lang = "en-US", rate = 0.8): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  await spellAsync(word, lang, rate);
}

export function stopSpeaking(): void {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
}

export function isTtsAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Đoạn văn có nội dung đáng đọc không? Trả false nếu chỉ gồm dấu câu/khoảng trắng
 * (vd ", " hoặc ". ") — để TTS không đọc thành "phẩy", "chấm".
 */
export function isSpeakable(text: string): boolean {
  return /[\p{L}\p{N}]/u.test(text);
}
