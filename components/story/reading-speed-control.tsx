"use client";

import { Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { READING_SPEEDS } from "@/hooks/use-reading-rate";

interface ReadingSpeedControlProps {
  rate: number;
  onChange: (value: number) => void;
  className?: string;
}

/** Pill chọn tốc độ đọc truyện (Chậm / Vừa / Nhanh). */
export function ReadingSpeedControl({ rate, onChange, className }: ReadingSpeedControlProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border bg-card p-1 text-xs",
        className,
      )}
      role="group"
      aria-label="Tốc độ đọc"
    >
      <Gauge className="ml-1.5 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      {READING_SPEEDS.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => onChange(s.value)}
          aria-pressed={rate === s.value}
          className={cn(
            "rounded-full px-2.5 py-1 font-medium transition-colors",
            rate === s.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
