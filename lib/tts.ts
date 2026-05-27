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

export function stopSpeaking(): void {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
}

export function isTtsAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
