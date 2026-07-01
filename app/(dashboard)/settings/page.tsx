"use client";

import Link from "next/link";
import { Focus, Loader2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemePicker } from "@/components/focus/theme-picker";
import { ProfileSection } from "@/components/settings/profile-section";
import { PronounceSection } from "@/components/settings/pronounce-section";
import { DailyGoalSection } from "@/components/settings/daily-goal-section";
import { StreakSection } from "@/components/settings/streak-section";
import { useProgress } from "@/hooks/use-progress";

export default function SettingsPage() {
  const { data: progress, isLoading } = useProgress();

  if (isLoading || !progress) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Cài đặt</h1>
        <p className="text-sm text-muted-foreground">
          Tuỳ chỉnh mục tiêu học và các thông số cá nhân.
        </p>
      </header>

      <ProfileSection progress={progress} />

      <section className="rounded-2xl border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Giao diện</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Chọn chế độ hiển thị: sáng, tối, hoặc theo hệ thống của thiết bị.
        </p>
        <ThemeToggle className="flex-wrap" />

        <div className="mt-6 border-t pt-5">
          <h3 className="mb-1 text-sm font-semibold">Màu chủ đề</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Áp dụng cho toàn bộ ứng dụng. Chọn &quot;Mặc định&quot; để theo chế độ sáng/tối.
          </p>
          <ThemePicker className="items-start" hideLabel />
        </div>
      </section>

      <PronounceSection />

      <section className="rounded-2xl border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Focus className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Chế độ tập trung</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Màn hình toàn cảnh với đồng hồ thời gian thực hoặc bộ đếm Pomodoro để tập
          trung học. Nhấn Esc để thoát.
        </p>
        <Link href="/focus">
          <Button>
            <Focus className="h-4 w-4" /> Mở chế độ tập trung
          </Button>
        </Link>
      </section>

      <DailyGoalSection progress={progress} />

      <StreakSection progress={progress} />
    </div>
  );
}
