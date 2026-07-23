"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ChevronRight, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSetDeckLearned } from "@/hooks/use-decks";
import { cn } from "@/lib/utils";
import type { DeckWithCounts } from "@/lib/types";

interface DeckCardProps {
  deck: DeckWithCounts;
}

export function DeckCard({ deck }: DeckCardProps) {
  const setLearned = useSetDeckLearned(deck.id);
  // Cho đánh dấu học xong ngay tại thẻ khi: đã mở khóa, chưa học xong, và đã đủ bài tập.
  const canMarkDone = !deck.locked && !deck.learned && deck.exercisesDone === true;

  const handleMarkDone = async () => {
    try {
      await setLearned.mutateAsync(true);
      toast.success("Đã đánh dấu học xong 🎉");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi cập nhật");
    }
  };

  return (
    <motion.div
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md",
        deck.locked && "opacity-60",
      )}
    >
      {/* Link phủ toàn thẻ — bấm bất kỳ đâu (trừ nút) để vào deck. */}
      <Link
        href={`/decks/${deck.id}`}
        className="absolute inset-0 rounded-xl"
        aria-label={deck.name}
      />

      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
        style={{ backgroundColor: `${deck.color}20`, color: deck.color }}
      >
        {deck.icon ?? "📘"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold">{deck.name}</h3>
          {deck.learned ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-3 w-3" /> Đã học
            </span>
          ) : deck.locked ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Lock className="h-3 w-3" /> Khóa
            </span>
          ) : null}
        </div>
        {deck.description ? (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {deck.description}
          </p>
        ) : null}
      </div>

      {/* Nút đánh dấu học xong nổi trên Link (z-10) để nhận click riêng. */}
      {canMarkDone ? (
        <Button
          size="sm"
          className="relative z-10 shrink-0 rounded-full"
          onClick={handleMarkDone}
          disabled={setLearned.isPending}
          title="Đánh dấu học xong để mở khóa Unit kế tiếp"
        >
          {setLearned.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Đánh dấu học xong
        </Button>
      ) : deck.locked ? (
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
      ) : (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      )}
    </motion.div>
  );
}
