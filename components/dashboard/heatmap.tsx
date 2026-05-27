"use client";

import { useMemo } from "react";
import type { StatsSeriesPoint } from "@/hooks/use-progress";

interface HeatmapProps {
  series: StatsSeriesPoint[];
}

function levelFor(count: number): number {
  if (count === 0) return 0;
  if (count < 5) return 1;
  if (count < 15) return 2;
  if (count < 30) return 3;
  return 4;
}

const LEVEL_COLORS = [
  "rgb(40, 40, 40)",
  "rgb(14, 68, 41)",
  "rgb(0, 109, 50)",
  "rgb(38, 166, 65)",
  "rgb(57, 211, 83)",
];

export function Heatmap({ series }: HeatmapProps) {
  const weeks = useMemo(() => {
    if (series.length === 0) return [];
    const first = new Date(series[0].date);
    const startDow = first.getDay();
    const padded: Array<StatsSeriesPoint | null> = [];
    for (let i = 0; i < startDow; i++) padded.push(null);
    padded.push(...series);
    const result: Array<Array<StatsSeriesPoint | null>> = [];
    for (let i = 0; i < padded.length; i += 7) {
      result.push(padded.slice(i, i + 7));
    }
    return result;
  }, [series]);

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">365 ngày qua</h3>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span>Ít</span>
          {LEVEL_COLORS.map((color, i) => (
            <span
              key={i}
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: color }}
            />
          ))}
          <span>Nhiều</span>
        </div>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }).map((_, di) => {
                const cell = week[di];
                if (!cell) {
                  return (
                    <span
                      key={di}
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: "transparent" }}
                    />
                  );
                }
                const level = levelFor(cell.reviewed);
                return (
                  <span
                    key={di}
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: LEVEL_COLORS[level] }}
                    title={`${cell.date}: ${cell.reviewed} từ`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
