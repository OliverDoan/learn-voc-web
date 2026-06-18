"use client";

import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PHASE_LABELS,
  usePomodoro,
  type PomodoroDurations,
} from "@/hooks/use-pomodoro";

interface Preset {
  label: string;
  durations: PomodoroDurations;
}

const PRESETS: Preset[] = [
  { label: "25 / 5", durations: { focus: 25, shortBreak: 5, longBreak: 15 } },
  { label: "45 / 15", durations: { focus: 45, shortBreak: 15, longBreak: 30 } },
  { label: "50 / 10", durations: { focus: 50, shortBreak: 10, longBreak: 20 } },
];

function formatTime(totalSeconds: number): string {
  const mm = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = (totalSeconds % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

const RADIUS = 140;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Bộ đếm Pomodoro với vòng tiến độ, điều khiển và preset thời lượng. */
export function PomodoroTimer() {
  const {
    phase,
    secondsLeft,
    isRunning,
    completedFocus,
    durations,
    progress,
    toggle,
    reset,
    skip,
    setDurations,
  } = usePomodoro();

  const isBreak = phase !== "focus";

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Vòng tiến độ + thời gian */}
      <div className="relative grid place-items-center">
        <svg
          width="320"
          height="320"
          viewBox="0 0 320 320"
          className="-rotate-90"
        >
          <circle
            cx="160"
            cy="160"
            r={RADIUS}
            fill="none"
            strokeWidth="10"
            className="stroke-border"
          />
          <circle
            cx="160"
            cy="160"
            r={RADIUS}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            className={cn(
              "transition-[stroke-dashoffset] duration-1000 ease-linear",
              isBreak ? "stroke-emerald-500" : "stroke-primary",
            )}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span
            className={cn(
              "mb-1 text-sm font-semibold uppercase tracking-widest",
              isBreak ? "text-emerald-500" : "text-primary",
            )}
          >
            {PHASE_LABELS[phase]}
          </span>
          <span className="text-7xl font-bold tabular-nums tracking-tight">
            {formatTime(secondsLeft)}
          </span>
        </div>
      </div>

      {/* Điều khiển */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={reset} aria-label="Đặt lại">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button size="lg" className="w-32" onClick={toggle}>
          {isRunning ? (
            <>
              <Pause className="h-4 w-4" /> Tạm dừng
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Bắt đầu
            </>
          )}
        </Button>
        <Button variant="outline" size="icon" onClick={skip} aria-label="Bỏ qua">
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Số phiên đã hoàn thành + preset */}
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <span>Đã hoàn thành: {completedFocus} phiên tập trung</span>
        <div className="flex gap-2">
          {PRESETS.map((preset) => {
            const active = durations.focus === preset.durations.focus;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => setDurations(preset.durations)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-accent hover:text-foreground",
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
