"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDownToLine, ArrowUpToLine, Pause, Play } from "lucide-react";

/** Các mức tốc độ tự cuộn (pixel mỗi khung hình ~60fps). */
const SPEEDS = [
  { label: "1×", px: 1.2 },
  { label: "2×", px: 2.6 },
  { label: "3×", px: 4.5 },
] as const;

/**
 * Bộ điều khiển tự cuộn nổi (góc phải, giữa màn hình):
 * - Lên đầu / Xuống cuối trang.
 * - Bật/tắt tự cuộn liên tục, tự dừng khi chạm đáy.
 * - Đổi tốc độ. Cuộn ngược bằng chuột/touch sẽ tự tạm dừng.
 */
export function AutoScrollControls() {
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);
  const rafRef = useRef<number | null>(null);
  const speedRef = useRef<number>(SPEEDS[0].px);

  useEffect(() => {
    speedRef.current = SPEEDS[speedIdx].px;
  }, [speedIdx]);

  // Vòng lặp tự cuộn bằng requestAnimationFrame.
  useEffect(() => {
    if (!playing) return;

    const step = () => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      window.scrollBy(0, speedRef.current);
      // Đã chạm đáy → dừng.
      if (window.scrollY >= max - 1) {
        setPlaying(false);
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [playing]);

  // Người dùng tự cuộn lên → tạm dừng để không "giành" điều khiển.
  useEffect(() => {
    if (!playing) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) setPlaying(false);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [playing]);

  const scrollToTop = useCallback(() => {
    setPlaying(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToBottom = useCallback(() => {
    setPlaying(false);
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const cycleSpeed = useCallback(() => {
    setSpeedIdx((i) => (i + 1) % SPEEDS.length);
  }, []);

  const btnClass =
    "flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

  return (
    <div className="fixed right-3 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-0.5 rounded-full border bg-card/95 p-1 shadow-lg backdrop-blur print:hidden">
      <button type="button" onClick={scrollToTop} className={btnClass} aria-label="Lên đầu" title="Lên đầu">
        <ArrowUpToLine className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
          playing
            ? "bg-primary text-primary-foreground"
            : "text-primary hover:bg-accent"
        }`}
        aria-label={playing ? "Dừng tự cuộn" : "Tự cuộn"}
        aria-pressed={playing}
        title={playing ? "Dừng tự cuộn" : "Tự cuộn xuống"}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>

      <button
        type="button"
        onClick={cycleSpeed}
        className="flex h-7 w-9 items-center justify-center rounded-full text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Đổi tốc độ cuộn"
        title="Tốc độ cuộn"
      >
        {SPEEDS[speedIdx].label}
      </button>

      <button type="button" onClick={scrollToBottom} className={btnClass} aria-label="Xuống cuối" title="Xuống cuối">
        <ArrowDownToLine className="h-4 w-4" />
      </button>
    </div>
  );
}
