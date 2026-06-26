"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Play, Sparkles } from "lucide-react";
import type { DeckWithCounts } from "@/lib/types";

interface DeckCardProps {
  deck: DeckWithCounts;
}

export function DeckCard({ deck }: DeckCardProps) {
  const total = deck._count.cards;

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.15 }}>
      <Link
        href={`/decks/${deck.id}`}
        className="group block overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg"
      >
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
              style={{ backgroundColor: `${deck.color}20`, color: deck.color }}
            >
              {deck.icon ?? "📘"}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold">{deck.name}</h3>
              {deck.description ? (
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {deck.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <Stat icon={<BookOpen className="h-3 w-3" />} label="Tổng" value={total} />
            <Stat
              icon={<Play className="h-3 w-3 text-orange-400" />}
              label="Cần ôn"
              value={deck.due}
              accent={deck.due > 0 ? "text-orange-400" : ""}
            />
            <Stat
              icon={<Sparkles className="h-3 w-3 text-blue-400" />}
              label="Mới"
              value={deck.newCount}
              accent={deck.newCount > 0 ? "text-blue-400" : ""}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-md bg-muted/40 p-2">
      <div className={`flex items-center justify-center gap-1 font-semibold ${accent ?? ""}`}>
        {icon} {value}
      </div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}
