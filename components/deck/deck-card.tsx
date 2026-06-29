"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeckWithCounts } from "@/lib/types";

interface DeckCardProps {
  deck: DeckWithCounts;
}

export function DeckCard({ deck }: DeckCardProps) {
  return (
    <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
      <Link
        href={`/decks/${deck.id}`}
        className={cn(
          "group flex items-center gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md",
          deck.locked && "opacity-60",
        )}
      >
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
        {deck.locked ? (
          <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        )}
      </Link>
    </motion.div>
  );
}
