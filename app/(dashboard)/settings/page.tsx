"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Target } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProgress, useUpdateProgress } from "@/hooks/use-progress";

const PRESETS = [10, 20, 30, 50] as const;
const MIN_GOAL = 1;
const MAX_GOAL = 200;

export default function SettingsPage() {
  const { data: progress, isLoading } = useProgress();
  const update = useUpdateProgress();

  const [dailyGoal, setDailyGoal] = useState<string>("");

  useEffect(() => {
    if (progress) setDailyGoal(String(progress.dailyGoal));
  }, [progress]);

  if (isLoading || !progress) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const parsedGoal = Number(dailyGoal);
  const goalIsValid =
    Number.isInteger(parsedGoal) && parsedGoal >= MIN_GOAL && parsedGoal <= MAX_GOAL;
  const hasChanges = goalIsValid && parsedGoal !== progress.dailyGoal;

  const handleSave = async () => {
    if (!goalIsValid) {
      toast.error(`Mục tiêu phải từ ${MIN_GOAL} đến ${MAX_GOAL} từ/ngày`);
      return;
    }
    try {
      await update.mutateAsync({ dailyGoal: parsedGoal });
      toast.success(`Đã đặt mục tiêu ${parsedGoal} từ/ngày 🎯`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Lỗi khi lưu cấu hình",
      );
    }
  };

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Cài đặt</h1>
        <p className="text-sm text-muted-foreground">
          Tuỳ chỉnh mục tiêu học và các thông số cá nhân.
        </p>
      </header>

      <section className="rounded-2xl border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Mục tiêu mỗi ngày</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Số từ bạn muốn ôn/học mỗi ngày. Hệ thống sẽ ưu tiên đẩy đủ số này lên
          hàng đợi.
        </p>

        <div className="space-y-3">
          <div>
            <Label htmlFor="dailyGoal" className="mb-1.5 block text-sm">
              Số từ / ngày
            </Label>
            <Input
              id="dailyGoal"
              type="number"
              min={MIN_GOAL}
              max={MAX_GOAL}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(e.target.value)}
              className="max-w-[160px]"
            />
            {!goalIsValid && dailyGoal !== "" ? (
              <p className="mt-1.5 text-xs text-destructive">
                Phải là số nguyên từ {MIN_GOAL} đến {MAX_GOAL}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Gợi ý: {MIN_GOAL}–{MAX_GOAL} từ. Người mới nên bắt đầu từ 10–20.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setDailyGoal(String(n))}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  parsedGoal === n
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {n} từ
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Hiện tại:{" "}
              <span className="font-semibold text-foreground">
                {progress.dailyGoal}
              </span>{" "}
              từ/ngày
            </p>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || update.isPending}
            >
              {update.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Lưu
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
