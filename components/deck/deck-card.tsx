"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { DeckWithCounts } from "@/lib/types";

interface DeckCardProps {
  deck: DeckWithCounts;
}

export function DeckCard({ deck }: DeckCardProps) {
  return (
    <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
      <Link
        href={`/decks/${deck.id}`}
        className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
      >
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
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
    </motion.div>
  );
}
