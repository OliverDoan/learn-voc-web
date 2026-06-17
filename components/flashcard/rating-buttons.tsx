"use client";

import { cn } from "@/lib/utils";
import { type Rating } from "@/lib/constants";
import { haptic } from "@/lib/haptic";
import type { IntervalPreview } from "@/lib/srs";

interface RatingButtonsProps {
  intervals: IntervalPreview;
  onRate: (rating: Rating) => void;
  disabled?: boolean;
}

function formatInterval(days: number): string {
  if (days < 1) return "1 phút";
  if (days < 30) return `${days} ngày`;
  if (days < 365) return `${Math.round(days / 30)} tháng`;
  return `${Math.round(days / 365)} năm`;
}

interface Item {
  rating: Rating;
  label: string;
  interval: number;
  color: string;
}

export function RatingButtons({ intervals, onRate, disabled }: RatingButtonsProps) {
  const items: Item[] = [
    { rating: 1, label: "Lại", interval: intervals.again, color: "#ff8f8f" },
    { rating: 2, label: "Khó", interval: intervals.hard, color: "#ffd27a" },
    { rating: 3, label: "Tốt", interval: intervals.good, color: "#8fe3b4" },
    { rating: 4, label: "Dễ", interval: intervals.easy, color: "#ffffff" },
  ];

  return (
    <div
      className="flex w-full max-w-xl overflow-hidden rounded-2xl"
      style={{ border: "1px solid rgba(255,255,255,.14)", background: "#00004F" }}
    >
      {items.map((it, i) => {
        const isEasy = it.rating === 4;
        return (
          <button
            key={it.rating}
            type="button"
            disabled={disabled}
            onClick={() => {
              haptic(it.rating === 1 ? "fail" : it.rating >= 3 ? "success" : "warn");
              onRate(it.rating);
            }}
            className={cn(
              "flex-1 px-2 py-4 text-center transition-colors disabled:opacity-50",
              !isEasy && "hover:bg-white/5",
            )}
            style={{
              borderRight: i < items.length - 1 ? "1px solid rgba(255,255,255,.12)" : undefined,
              background: isEasy ? "#173DC9" : undefined,
            }}
          >
            <div className="text-[14.5px] font-bold" style={{ color: it.color }}>
              {it.label}
            </div>
            <div
              className="font-phonetic mt-0.5 text-[10.5px]"
              style={{ color: isEasy ? "rgba(255,255,255,.75)" : "rgba(255,255,255,.5)" }}
            >
              {formatInterval(it.interval)}
            </div>
          </button>
        );
      })}
    </div>
  );
}
