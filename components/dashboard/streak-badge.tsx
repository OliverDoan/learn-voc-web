"use client";

import { Flame, Snowflake } from "lucide-react";
import { motion } from "framer-motion";

interface StreakBadgeProps {
  current: number;
  longest: number;
  freezeTokens: number;
}

export function StreakBadge({ current, longest, freezeTokens }: StreakBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-4 rounded-2xl border bg-gradient-to-r from-orange-500/10 to-red-500/10 p-5"
    >
      <div className="relative">
        <Flame className="h-12 w-12 text-orange-500" />
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-1.5 text-xs font-bold text-white">
          {current}
        </span>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Streak hiện tại
        </p>
        <p className="text-2xl font-bold">{current} ngày</p>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span>🏆 Dài nhất: {longest}</span>
          <span className="flex items-center gap-1">
            <Snowflake className="h-3 w-3" /> {freezeTokens}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
