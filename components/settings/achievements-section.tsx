"use client";

import { Loader2, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useAchievements } from "@/hooks/use-achievements";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { cn } from "@/lib/utils";

/** Lưới huy hiệu: đã mở khoá thì nổi bật, chưa thì mờ kèm mô tả điều kiện. */
export function AchievementsSection() {
  const { data, isLoading } = useAchievements();
  const unlocked = new Set(data?.unlockedIds ?? []);

  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Huy hiệu</h2>
        {!isLoading ? (
          <span className="ml-auto font-mono text-xs text-muted-foreground">
            {unlocked.size}/{ACHIEVEMENTS.length}
          </span>
        ) : null}
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Mở khoá bằng cách duy trì chuỗi ngày học và tích luỹ số lượt ôn.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ACHIEVEMENTS.map((a, i) => {
            const isUnlocked = unlocked.has(a.id);
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: Math.min(i * 0.02, 0.3) }}
                title={a.description}
                className={cn(
                  "flex items-start gap-2.5 rounded-xl border p-3",
                  isUnlocked
                    ? "border-primary/30 bg-primary/5"
                    : "border-dashed opacity-60",
                )}
              >
                <span
                  className={cn("text-xl leading-none", !isUnlocked && "grayscale")}
                  aria-hidden
                >
                  {a.icon}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {a.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
