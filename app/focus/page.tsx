"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Maximize, Minimize, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClockDisplay } from "@/components/focus/clock-display";
import { PomodoroTimer } from "@/components/focus/pomodoro-timer";
import { useTheme } from "@/components/theme-provider";
import { getFocusTheme } from "@/lib/focus-themes";
import { useFullscreen } from "@/hooks/use-fullscreen";

type FocusMode = "clock" | "pomodoro";

/**
 * Trang "Focus Mode" toàn màn hình để tập trung học: đồng hồ thời gian thực
 * hoặc bộ đếm Pomodoro, kèm lối tắt mở bộ từ. Nhấn Esc hoặc nút X để thoát.
 */
export default function FocusPage() {
  const router = useRouter();
  const [mode, setMode] = useState<FocusMode>("clock");
  const { palette } = useTheme();
  const focusTheme = getFocusTheme(palette);
  const { isFullscreen, toggle: toggleFullscreen, exit: exitFullscreen } =
    useFullscreen();
  // "Mặc định" → theo nền app; còn lại → gradient riêng cho trang Focus
  const background = focusTheme.surface ? focusTheme.background : undefined;

  const handleExit = () => {
    void exitFullscreen();
    router.back();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Đang toàn màn hình → để trình duyệt tự thoát fullscreen, chưa rời trang
      if (document.fullscreenElement) return;
      router.back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div
      style={background ? { background } : undefined}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground select-none transition-colors duration-300"
    >
      {/* Chuyển chế độ */}
      <div className="absolute left-1/2 top-6 flex -translate-x-1/2 gap-1 rounded-full border border-border bg-card p-1">
        {(["clock", "pomodoro"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              mode === m
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m === "clock" ? "Đồng hồ" : "Pomodoro"}
          </button>
        ))}
      </div>

      {/* Nút toàn màn hình + thoát */}
      <div className="absolute right-5 top-5 flex items-center gap-1">
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
          title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {isFullscreen ? (
            <Minimize className="h-5 w-5" />
          ) : (
            <Maximize className="h-5 w-5" />
          )}
        </button>
        <button
          type="button"
          onClick={handleExit}
          aria-label="Thoát focus mode"
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nội dung chính */}
      {mode === "clock" ? <ClockDisplay /> : <PomodoroTimer />}

      {/* Khu vực dưới: gợi ý thoát */}
      <div className="absolute inset-x-0 bottom-6 flex flex-col items-center px-4">
        <p className="text-xs text-muted-foreground/70">
          {isFullscreen
            ? "Nhấn Esc để thoát toàn màn hình"
            : "Nhấn nút ⛶ để vào toàn màn hình • Esc để thoát"}
        </p>
      </div>
    </div>
  );
}
