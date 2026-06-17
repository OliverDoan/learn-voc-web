"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Check, Layers, Loader2, Play, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDecks } from "@/hooks/use-decks";
import { useProgress, useStats } from "@/hooks/use-progress";
import { useWeakWords } from "@/hooks/use-weak-words";
import type { DeckWithCounts } from "@/lib/types";

const VN_DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function DashboardPage() {
  const { data: decks } = useDecks();
  const { data: progress, isLoading: pLoading } = useProgress();
  const { data: stats, isLoading: sLoading } = useStats(365);
  const { data: weakWords } = useWeakWords();

  const totalDue = useMemo(
    () => (decks ? decks.reduce((sum, d) => sum + d.due, 0) : 0),
    [decks],
  );

  const dueDecks = useMemo(
    () =>
      (decks ?? [])
        .filter((d) => d.due > 0)
        .sort((a, b) => b.due - a.due)
        .slice(0, 4),
    [decks],
  );

  const matureCount = useMemo(
    () => stats?.stateDistribution.find((s) => s.state === "MATURE")?.count ?? 0,
    [stats],
  );

  const accuracy7d = useMemo(() => {
    if (!stats) return 0;
    const last7 = stats.series.slice(-7);
    const total = last7.reduce((s, d) => s + d.total, 0);
    const correct = last7.reduce((s, d) => s + d.correct, 0);
    return total === 0 ? 0 : Math.round((correct / total) * 100);
  }, [stats]);

  const weekStrip = useMemo(() => {
    const last7 = (stats?.series ?? []).slice(-7);
    const todayKey = format(new Date(), "yyyy-MM-dd");
    return last7.map((d) => {
      const date = new Date(d.date);
      return {
        label: VN_DAYS[date.getDay()],
        done: d.reviewed > 0,
        today: format(date, "yyyy-MM-dd") === todayKey,
      };
    });
  }, [stats]);

  if (pLoading || sLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const streak = progress?.currentStreak ?? 0;
  const dateLabel = format(new Date(), "EEEE · dd / MM", { locale: vi });

  return (
    <div className="container mx-auto max-w-6xl p-6 md:p-8">
      {/* eyebrow + greeting */}
      <span className="eyebrow capitalize">{dateLabel}</span>
      <h1 className="mt-2.5 text-2xl font-bold tracking-tight md:text-[26px]">
        Hôm nay học gì nào?
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {streak > 0
          ? `Bạn đang ở chuỗi ${streak} ngày — hoàn thành ôn tập để giữ lửa nhé.`
          : "Bắt đầu ôn tập hôm nay để khởi động chuỗi ngày học."}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.55fr_1fr]">
        {/* MAIN — cần ôn hôm nay */}
        <div>
          <div className="mb-3.5 flex items-center justify-between">
            <h2 className="text-[15.5px] font-bold">Cần ôn hôm nay</h2>
            <span className="font-mono rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {totalDue} từ
            </span>
          </div>

          {dueDecks.length === 0 ? (
            <div className="rounded-[14px] border bg-card p-8 text-center">
              <Check className="mx-auto mb-2 h-7 w-7 text-success" />
              <p className="text-sm text-muted-foreground">
                Tuyệt vời! Không còn từ nào cần ôn hôm nay.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {dueDecks.map((d) => (
                <DueDeckRow key={d.id} deck={d} />
              ))}
            </div>
          )}

          {totalDue > 0 ? (
            <Link href="/study/all">
              <Button
                variant="outline"
                className="mt-3.5 w-full rounded-full border-[1.5px] border-primary py-6 text-sm font-bold text-primary hover:bg-primary/5"
              >
                <Play className="h-4 w-4" />
                Ôn tất cả {totalDue} từ (mọi deck)
              </Button>
            </Link>
          ) : null}
        </div>

        {/* SIDE column */}
        <div className="flex flex-col gap-3.5">
          {/* Tuần này */}
          <div className="rounded-[14px] border bg-card p-4">
            <div className="mb-3.5 text-[13px] font-bold">Tuần này</div>
            <div className="flex justify-between">
              {weekStrip.length === 0 ? (
                <span className="text-xs text-muted-foreground">Chưa có dữ liệu</span>
              ) : (
                weekStrip.map((d, i) => (
                  <div key={i} className="text-center">
                    <div
                      className={
                        d.done
                          ? "flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                          : d.today
                            ? "flex h-7 w-7 items-center justify-center rounded-lg border-[1.5px] border-primary bg-primary/10 text-primary"
                            : "flex h-7 w-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground"
                      }
                    >
                      {d.done ? <Check className="h-4 w-4" /> : (
                        <span className="font-display text-xs font-semibold">{d.label}</span>
                      )}
                    </div>
                    <div
                      className={`mt-1.5 text-[10.5px] ${d.today ? "font-semibold text-primary" : "text-muted-foreground"}`}
                    >
                      {d.label}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* stats card */}
          <div className="flex flex-col gap-3 rounded-[14px] border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-muted-foreground">Từ đã thuộc</span>
              <span className="font-display text-[17px] font-bold">{matureCount}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-muted-foreground">Độ chính xác</span>
              <span className="font-display text-[17px] font-bold text-primary">
                {accuracy7d}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Từ hay sai */}
      {weakWords && weakWords.length > 0 ? (
        <section className="mt-8">
          <div className="mb-3.5 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-[15.5px] font-bold">
              <TriangleAlert className="h-4 w-4 text-warning" />
              Từ hay sai
            </h2>
            <Link
              href={`/study/all?ids=${weakWords.slice(0, 20).map((w) => w.id).join(",")}`}
            >
              <Button
                size="sm"
                className="rounded-full shadow-[0_8px_20px_rgba(23,61,201,.28)]"
              >
                <Play className="h-3.5 w-3.5" />
                Ôn {Math.min(weakWords.length, 20)} từ này
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {weakWords.slice(0, 6).map((w) => (
              <Link
                key={w.id}
                href={`/study/all?ids=${w.id}`}
                className="flex items-center gap-3 rounded-[14px] border bg-card p-3.5 transition-colors hover:border-primary"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate font-bold">{w.word}</span>
                    <span className="truncate text-xs text-muted-foreground">{w.meaning}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{w.deckName}</div>
                </div>
                <span className="font-mono shrink-0 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive">
                  sai {w.wrong}/{w.total}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Decks shortcut */}
      <section className="mt-8">
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="text-[15.5px] font-bold">Decks của bạn</h2>
          <Link href="/decks" className="text-sm text-primary hover:underline">
            Tất cả →
          </Link>
        </div>
        {!decks || decks.length === 0 ? (
          <div className="rounded-[14px] border border-dashed bg-card py-12 text-center">
            <p className="mb-4 text-muted-foreground">Chưa có deck nào</p>
            <Link href="/decks">
              <Button className="rounded-full">Tạo deck đầu tiên</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {decks.slice(0, 4).map((d) => (
              <DueDeckRow key={d.id} deck={d} hideAction />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

interface DueDeckRowProps {
  deck: DeckWithCounts;
  hideAction?: boolean;
}

function DueDeckRow({ deck, hideAction }: DueDeckRowProps) {
  const total = deck._count.cards || 1;
  const learnedPct = Math.round(((total - deck.newCount) / total) * 100);
  const accent = deck.color || "#173DC9";

  return (
    <div className="flex items-center gap-3.5 rounded-[14px] border bg-card p-3.5 shadow-[0_1px_2px_rgba(0,0,13,.05)]">
      <span
        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[11px] text-white"
        style={{ background: accent }}
      >
        <Layers className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">{deck.name}</div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full"
            style={{ width: `${learnedPct}%`, background: accent }}
          />
        </div>
      </div>
      {hideAction ? null : (
        <>
          <div className="shrink-0 text-right">
            <div className="font-display text-[19px] font-bold leading-none text-primary">
              {deck.due}
            </div>
            <div className="mt-0.5 text-[10.5px] text-muted-foreground">cần ôn</div>
          </div>
          <Link href={`/study/${deck.id}`} className="shrink-0">
            <Button
              size="sm"
              className="rounded-full px-4 shadow-[0_8px_20px_rgba(23,61,201,.28)]"
            >
              Ôn
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
