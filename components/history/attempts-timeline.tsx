"use client";

import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getActivityDef } from "@/lib/deck-activities";
import { cn } from "@/lib/utils";
import type { AttemptHistoryItem } from "@/lib/types";

interface AttemptsTimelineProps {
  attempts: readonly AttemptHistoryItem[];
}

function activityLabel(key: string): string {
  return getActivityDef(key)?.label ?? key;
}

/** Timeline các lượt làm bài gần nhất, nhóm theo ngày. */
export function AttemptsTimeline({ attempts }: AttemptsTimelineProps) {
  if (attempts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center">
        <p className="text-sm text-muted-foreground">
          Chưa có lượt làm bài nào được ghi lại. Hãy làm một bài quiz hoặc bài kiểm tra.
        </p>
      </div>
    );
  }

  // Nhóm theo ngày (đã sắp mới → cũ từ server).
  const byDay = new Map<string, AttemptHistoryItem[]>();
  for (const a of attempts) {
    const day = a.createdAt.slice(0, 10); // YYYY-MM-DD
    const arr = byDay.get(day);
    if (arr) arr.push(a);
    else byDay.set(day, [a]);
  }

  return (
    <div className="space-y-6">
      {Array.from(byDay.entries()).map(([day, items]) => (
        <div key={day}>
          <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {format(new Date(day), "EEEE, dd/MM/yyyy", { locale: vi })}
          </h3>
          <ul className="space-y-2">
            {items.map((a) => {
              const scored = a.accuracy != null;
              const pass = scored && (a.accuracy ?? 0) >= 80;
              return (
                <li
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{activityLabel(a.activity)}</span>
                      <Link
                        href={`/decks/${a.deck.id}`}
                        className="inline-flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-primary"
                      >
                        <BookOpen className="h-3 w-3 shrink-0" />
                        {a.deck.name}
                      </Link>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {format(new Date(a.createdAt), "HH:mm")} · {a.totalCount} câu
                      {a.wrongCount > 0 ? ` · sai ${a.wrongCount}` : ""}
                    </p>
                  </div>
                  {scored ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 font-mono",
                        pass
                          ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                          : "border-amber-500/40 text-amber-600 dark:text-amber-400",
                      )}
                    >
                      {a.accuracy}%
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      hoàn thành
                    </Badge>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
