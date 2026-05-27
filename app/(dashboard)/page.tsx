"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Play, Sparkles, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DeckCard } from "@/components/deck/deck-card";
import { StreakBadge } from "@/components/dashboard/streak-badge";
import { DailyProgress } from "@/components/dashboard/daily-progress";
import { Heatmap } from "@/components/dashboard/heatmap";
import { useDecks } from "@/hooks/use-decks";
import { useProgress, useStats } from "@/hooks/use-progress";
import { xpToNextLevel } from "@/lib/xp";

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Chào buổi sáng";
  if (h < 14) return "Chào buổi trưa";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export default function DashboardPage() {
  const { data: decks } = useDecks();
  const { data: progress, isLoading: pLoading } = useProgress();
  const { data: stats, isLoading: sLoading } = useStats(365);

  const today = useMemo(() => {
    if (!stats) return null;
    return stats.series[stats.series.length - 1] ?? null;
  }, [stats]);

  const totalDue = useMemo(
    () => (decks ? decks.reduce((sum, d) => sum + d.due, 0) : 0),
    [decks],
  );
  const totalNew = useMemo(
    () => (decks ? decks.reduce((sum, d) => sum + d.newCount, 0) : 0),
    [decks],
  );
  const totalCards = useMemo(
    () => (decks ? decks.reduce((sum, d) => sum + d._count.cards, 0) : 0),
    [decks],
  );

  const matureCount = useMemo(
    () =>
      stats?.stateDistribution.find((s) => s.state === "MATURE")?.count ?? 0,
    [stats],
  );

  const accuracy7d = useMemo(() => {
    if (!stats) return 0;
    const last7 = stats.series.slice(-7);
    const total = last7.reduce((s, d) => s + d.total, 0);
    const correct = last7.reduce((s, d) => s + d.correct, 0);
    return total === 0 ? 0 : Math.round((correct / total) * 100);
  }, [stats]);

  const xpInfo = progress ? xpToNextLevel(progress.totalXp) : null;

  if (pLoading || sLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            {greeting()}, học từ chưa? 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Mỗi ngày 1 chút, từ vựng vững như đá.
          </p>
        </div>
        {progress && xpInfo ? (
          <div className="rounded-2xl border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Level {progress.level}</p>
            <p className="font-bold">{progress.totalXp} XP</p>
            <Progress value={xpInfo.pct} className="mt-1 h-1.5 w-32" />
          </div>
        ) : null}
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {progress ? (
          <StreakBadge
            current={progress.currentStreak}
            longest={progress.longestStreak}
            freezeTokens={progress.freezeTokens}
          />
        ) : null}
        {progress ? (
          <DailyProgress reviewed={today?.reviewed ?? 0} goal={progress.dailyGoal} />
        ) : null}
        <div className="grid grid-cols-3 gap-2 rounded-2xl border bg-card p-4 text-center">
          <SmallStat label="Tổng" value={totalCards} icon="📚" />
          <SmallStat label="Thuộc" value={matureCount} icon="🧠" />
          <SmallStat label="Đúng 7d" value={`${accuracy7d}%`} icon="🎯" />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ActionCard
          icon={<Play className="h-5 w-5" />}
          accent="orange"
          label="Cần ôn"
          value={totalDue}
          desc="từ đang chờ bạn"
          href={decks && decks.length > 0 ? `/decks/${decks[0].id}` : "/decks"}
          cta="Vào học"
        />
        <ActionCard
          icon={<Sparkles className="h-5 w-5" />}
          accent="blue"
          label="Từ mới"
          value={totalNew}
          desc="chưa học lần nào"
          href="/decks"
          cta="Khám phá"
        />
        <ActionCard
          icon={<Target className="h-5 w-5" />}
          accent="green"
          label="Hôm nay"
          value={today?.learned ?? 0}
          desc="từ mới đã học"
          href="/stats"
          cta="Xem stats"
        />
      </section>

      {stats ? (
        <section>
          <Heatmap series={stats.series} />
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Decks của bạn</h2>
          <Link
            href="/decks"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {!decks || decks.length === 0 ? (
          <div className="rounded-xl border border-dashed py-12 text-center">
            <p className="mb-4 text-muted-foreground">Chưa có deck nào</p>
            <Link href="/decks">
              <Button>Tạo deck đầu tiên</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {decks.slice(0, 6).map((d) => (
              <DeckCard key={d.id} deck={d} />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <Trophy className="mb-2 h-6 w-6 text-yellow-500" />
        <h3 className="font-semibold">Mở khoá huy hiệu</h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Học đều đặn để mở các thành tựu vui.
        </p>
        <Link
          href="/achievements"
          className="text-sm text-primary hover:underline"
        >
          Xem tất cả →
        </Link>
      </section>
    </div>
  );
}

function SmallStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: string;
}) {
  return (
    <div>
      <div className="text-xl">{icon}</div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

interface ActionCardProps {
  icon: React.ReactNode;
  accent: "orange" | "blue" | "green";
  label: string;
  value: number;
  desc: string;
  href: string;
  cta: string;
}

function ActionCard({ icon, accent, label, value, desc, href, cta }: ActionCardProps) {
  const colors = {
    orange: "border-orange-500/30 from-orange-500/15 to-orange-500/5 text-orange-500",
    blue: "border-blue-500/30 from-blue-500/15 to-blue-500/5 text-blue-500",
    green: "border-green-500/30 from-green-500/15 to-green-500/5 text-green-500",
  };
  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-2xl border bg-gradient-to-br p-5 transition-all hover:shadow-md ${colors[accent]}`}
    >
      <div className="mb-2">{icon}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="my-1 text-4xl font-bold text-foreground">{value}</div>
      <div className="mb-3 text-xs text-muted-foreground">{desc}</div>
      <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium">
        {cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
