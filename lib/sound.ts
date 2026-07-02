// Âm thanh phản hồi khi trả lời quiz — tạo bằng Web Audio API, không cần file mp3.

type SoundName = "correct" | "wrong";

const MUTE_KEY = "voca-sound-muted";

// Mỗi note: tần số (Hz), thời điểm bắt đầu (giây, so với lúc phát), độ dài (giây).
interface Note {
  freq: number;
  start: number;
  duration: number;
}

// "correct": 2 nốt đi lên vui tai (C5 → G5). "wrong": 1 nốt trầm ngắn.
const SOUNDS: Record<SoundName, Note[]> = {
  correct: [
    { freq: 523.25, start: 0, duration: 0.12 },
    { freq: 783.99, start: 0.1, duration: 0.16 },
  ],
  wrong: [{ freq: 196.0, start: 0, duration: 0.22 }],
};

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  return audioCtx;
}

/** Có đang tắt tiếng không (đọc từ localStorage). */
export function isSoundMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MUTE_KEY) === "1";
}

/** Bật/tắt tiếng, trả về trạng thái muted mới. */
export function toggleSoundMuted(): boolean {
  if (typeof window === "undefined") return false;
  const next = !isSoundMuted();
  localStorage.setItem(MUTE_KEY, next ? "1" : "0");
  return next;
}

/** Phát âm thanh phản hồi. Bỏ qua nếu đang tắt tiếng hoặc trình duyệt không hỗ trợ. */
export function playSound(name: SoundName): void {
  if (isSoundMuted()) return;
  const ctx = getContext();
  if (!ctx) return;
  try {
    // iOS/Chrome khoá AudioContext cho tới khi có tương tác — resume trong handler click là hợp lệ.
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    for (const note of SOUNDS[name]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = note.freq;
      // Envelope đơn giản: lên nhanh rồi tắt dần để tránh tiếng "click".
      const t0 = now + note.start;
      const t1 = t0 + note.duration;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t1);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t1 + 0.02);
    }
  } catch {
    // im lặng — âm thanh chỉ là phụ trợ
  }
}
