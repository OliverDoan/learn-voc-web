"use client";

import { Loader2 } from "lucide-react";
import { useProgress, useStats } from "@/hooks/use-progress";

interface Achievement {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  check: (ctx: AchievementContext) => boolean;
}

interface AchievementContext {
  totalCards: number;
  matureCards: number;
  currentStreak: number;
  totalXp: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-step",
    emoji: "🌱",
    name: "Bước đầu tiên",
    desc: "Học từ đầu tiên",
    check: (c) => c.totalCards >= 1,
  },
  {
    id: "century",
    emoji: "💯",
    name: "Trăm từ",
    desc: "100 từ trong bộ sưu tập",
    check: (c) => c.totalCards >= 100,
  },
  {
    id: "on-fire",
    emoji: "🔥",
    name: "Đang cháy",
    desc: "Streak 7 ngày",
    check: (c) => c.currentStreak >= 7,
  },
  {
    id: "marathon",
    emoji: "🏆",
    name: "Marathon",
    desc: "Streak 30 ngày",
    check: (c) => c.currentStreak >= 30,
  },
  {
    id: "brain-master",
    emoji: "🧠",
    name: "Não bộ chiến binh",
    desc: "500 từ đã thuộc",
    check: (c) => c.matureCards >= 500,
  },
  {
    id: "first-thousand",
    emoji: "⭐",
    name: "1000 XP",
    desc: "Đạt 1000 XP",
    check: (c) => c.totalXp >= 1000,
  },
  {
    id: "level-5",
    emoji: "🚀",
    name: "Level 5",
    desc: "Đạt level 5 (1600 XP)",
    check: (c) => c.totalXp >= 1600,
  },
];

export default function AchievementsPage() {
  const { data: progress, isLoading: pLoading } = useProgress();
  const { data: stats, isLoading: sLoading } = useStats(7);

  if (pLoading || sLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const ctx: AchievementContext = {
    totalCards: stats?.totalCards ?? 0,
    matureCards: stats?.stateDistribution.find((s) => s.state === "MATURE")?.count ?? 0,
    currentStreak: progress?.currentStreak ?? 0,
    totalXp: progress?.totalXp ?? 0,
  };

  const unlocked = ACHIEVEMENTS.filter((a) => a.check(ctx)).length;

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">Huy hiệu</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Đã mở: {unlocked} / {ACHIEVEMENTS.length}
      </p>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = a.check(ctx);
          return (
            <li
              key={a.id}
              className={`rounded-xl border bg-card p-4 text-center transition-all ${
                isUnlocked ? "" : "opacity-40 grayscale"
              }`}
            >
              <div className="mb-2 text-4xl">{a.emoji}</div>
              <h3 className="text-sm font-semibold">{a.name}</h3>
              <p className="mt-1 text-[10px] text-muted-foreground">{a.desc}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
