"use client";

import Link from "next/link";
import { Settings2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DailyProgressProps {
  reviewed: number;
  goal: number;
}

export function DailyProgress({ reviewed, goal }: DailyProgressProps) {
  const pct = goal === 0 ? 0 : Math.min(100, Math.round((reviewed / goal) * 100));
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Mục tiêu hôm nay</h3>
        <span className="text-sm text-muted-foreground">
          {reviewed} / {goal} từ
        </span>
      </div>
      <Progress value={reviewed} max={goal} className="h-3" />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {pct >= 100 ? "🎉 Hoàn thành! Quá tuyệt." : `${pct}% — cố lên!`}
        </p>
        <Link
          href="/settings"
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <Settings2 className="h-3 w-3" />
          Đổi mục tiêu
        </Link>
      </div>
    </div>
  );
}
