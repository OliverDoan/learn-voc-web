"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RATING_LABELS, type Rating } from "@/lib/constants";
import { haptic } from "@/lib/haptic";
import type { IntervalPreview } from "@/lib/srs";

interface RatingButtonsProps {
  intervals: IntervalPreview;
  onRate: (rating: Rating) => void;
  disabled?: boolean;
}

function formatInterval(days: number): string {
  if (days < 1) return "<1d";
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
}

const COLORS: Record<Rating, string> = {
  1: "bg-red-500 hover:bg-red-600",
  2: "bg-orange-500 hover:bg-orange-600",
  3: "bg-green-500 hover:bg-green-600",
  4: "bg-emerald-600 hover:bg-emerald-700",
};

export function RatingButtons({ intervals, onRate, disabled }: RatingButtonsProps) {
  const items: Array<{ rating: Rating; interval: number; key: string }> = [
    { rating: 1, interval: intervals.again, key: "1" },
    { rating: 2, interval: intervals.hard, key: "2" },
    { rating: 3, interval: intervals.good, key: "3" },
    { rating: 4, interval: intervals.easy, key: "4" },
  ];
  return (
    <div className="grid w-full max-w-xl grid-cols-4 gap-2">
      {items.map(({ rating, interval, key }) => (
        <Button
          key={rating}
          disabled={disabled}
          onClick={() => {
            haptic(rating === 1 ? "fail" : rating >= 3 ? "success" : "warn");
            onRate(rating);
          }}
          className={cn(
            "flex h-auto flex-col gap-1 py-3 text-white",
            COLORS[rating],
          )}
        >
          <span className="text-sm font-bold">{RATING_LABELS[rating]}</span>
          <span className="text-xs opacity-90">{formatInterval(interval)}</span>
          <span className="text-[10px] opacity-70">[{key}]</span>
        </Button>
      ))}
    </div>
  );
}
