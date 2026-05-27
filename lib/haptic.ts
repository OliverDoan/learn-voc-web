type HapticPattern = "tick" | "success" | "warn" | "fail";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tick: 10,
  success: [20, 30, 20],
  warn: 25,
  fail: [40, 60, 40],
};

export function haptic(pattern: HapticPattern): void {
  if (typeof window === "undefined") return;
  const nav = window.navigator;
  if (!nav || typeof nav.vibrate !== "function") return;
  try {
    nav.vibrate(PATTERNS[pattern]);
  } catch {
    // ignore
  }
}
