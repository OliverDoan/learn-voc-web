"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Heatmap } from "@/components/dashboard/heatmap";
import {
  AccuracyLineChart,
  ReviewedBarChart,
  StateDistributionPie,
} from "@/components/dashboard/stats-charts";
import { useProgress, useStats } from "@/hooks/use-progress";
import { Badge } from "@/components/ui/badge";

export default function StatsPage() {
  const { data: progress } = useProgress();
  const { data: stats, isLoading } = useStats(365);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) return <div className="p-6">Lỗi tải thống kê</div>;

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Thống kê</h1>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Tổng từ" value={stats.totalCards} />
        <Stat
          label="Đã thuộc"
          value={stats.stateDistribution.find((s) => s.state === "MATURE")?.count ?? 0}
        />
        <Stat label="Streak hiện tại" value={progress?.currentStreak ?? 0} />
        <Stat label="Streak dài nhất" value={progress?.longestStreak ?? 0} />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card title="Số từ ôn 30 ngày qua">
          <ReviewedBarChart series={stats.series} />
        </Card>
        <Card title="Phân bố trạng thái">
          <StateDistributionPie data={stats.stateDistribution} />
        </Card>
        <Card title="Tỷ lệ đúng 30 ngày qua">
          <AccuracyLineChart series={stats.series} />
        </Card>
        <Card title="Top 10 từ hay quên">
          {stats.topLapses.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có dữ liệu</p>
          ) : (
            <ul className="space-y-2">
              {stats.topLapses.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-md border bg-background/40 p-2 text-sm"
                >
                  <Link
                    href={`/decks/${c.deckId}`}
                    className="flex-1 truncate font-medium hover:underline"
                  >
                    {c.word}{" "}
                    <span className="text-xs text-muted-foreground">— {c.meaning}</span>
                  </Link>
                  <Badge variant="destructive" className="ml-2">
                    {c.lapses} lần
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <Heatmap series={stats.series} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}
