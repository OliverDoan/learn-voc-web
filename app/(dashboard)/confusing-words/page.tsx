"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, ChevronDown, Eye, EyeOff, Lightbulb, Volume2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CONFUSING_ENTRIES } from "@/lib/confusing-words";
import { speak } from "@/lib/tts";
import { cn } from "@/lib/utils";

const norm = (s: string): string => s.trim().toLowerCase();

export default function ConfusingWordsPage() {
  const [query, setQuery] = useState("");
  // Ẩn nghĩa/ví dụ để tự kiểm tra (active recall) — nhìn từ, tự nhớ nghĩa.
  const [hideMeaning, setHideMeaning] = useState(false);
  // Các cặp đang mở (dropdown). Khi tìm kiếm sẽ tự mở hết kết quả.
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const entries = useMemo(() => {
    const q = norm(query);
    if (!q) return CONFUSING_ENTRIES;
    return CONFUSING_ENTRIES.filter((e) =>
      e.terms.some((t) => norm(t.word).includes(q) || norm(t.note).includes(q)),
    );
  }, [query]);

  const searching = norm(query).length > 0;

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ArrowLeftRight className="h-6 w-6 text-primary" /> Từ dễ lẫn
        </h1>
        <p className="text-sm text-muted-foreground">
          Các cặp từ hay nhầm lẫn — điểm khác nhau cốt lõi, ví dụ và mẹo nhớ nhanh.
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm từ (vd: change, chance…)"
          className="sm:max-w-xs"
        />
        <Button
          type="button"
          variant={hideMeaning ? "default" : "outline"}
          onClick={() => setHideMeaning((v) => !v)}
          className="gap-2"
        >
          {hideMeaning ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {hideMeaning ? "Đang ẩn nghĩa — tự kiểm tra" : "Ẩn nghĩa để tự kiểm tra"}
        </Button>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => {
          // Khi đang tìm kiếm thì luôn mở để thấy kết quả ngay.
          const open = searching || openIds.has(entry.id);
          return (
            <div key={entry.id} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              {/* Header — nút bấm để mở/đóng dropdown */}
              <button
                type="button"
                onClick={() => toggle(entry.id)}
                aria-expanded={open}
                aria-controls={`entry-${entry.id}`}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                  open && "border-b bg-muted/30",
                )}
              >
                <span className="text-2xl leading-none">{entry.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold">
                    {entry.terms.map((t, i) => (
                      <span key={t.word} className="flex items-center gap-2">
                        {i > 0 ? <span className="text-muted-foreground">vs</span> : null}
                        <span className="text-primary">{t.word}</span>
                      </span>
                    ))}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{entry.difference}</p>
                </div>
                <ChevronDown
                  className={cn(
                    "mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                    open && "rotate-180",
                  )}
                />
              </button>

              {open ? (
                <div id={`entry-${entry.id}`}>
                  {/* Các vế */}
                  <div
                    className={cn(
                      "grid gap-px bg-border",
                      entry.terms.length > 1 ? "sm:grid-cols-2" : "grid-cols-1",
                    )}
                  >
                    {entry.terms.map((t) => (
                      <div key={t.word} className="bg-card p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{t.word}</span>
                          <button
                            type="button"
                            onClick={() => speak(t.word)}
                            className="text-muted-foreground transition-colors hover:text-primary"
                            aria-label={`Phát âm ${t.word}`}
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                        </div>
                        {!hideMeaning ? (
                          <>
                            <p className="mt-1 text-sm">{t.note}</p>
                            <ul className="mt-2 space-y-1.5">
                              {t.examples.map((ex) => (
                                <li key={ex.en} className="text-sm">
                                  <span className="text-foreground">{ex.en}</span>
                                  <br />
                                  <span className="text-muted-foreground">{ex.vi}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <p className="mt-1 text-sm italic text-muted-foreground">
                            Tự nhớ nghĩa & đặt câu… (bỏ ẩn để xem)
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Mẹo nhớ */}
                  {entry.tip && !hideMeaning ? (
                    <div className="flex items-start gap-2 border-t bg-amber-500/5 px-4 py-2.5 text-sm">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <span className="text-muted-foreground">{entry.tip}</span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}

        {entries.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Không tìm thấy từ nào khớp “{query}”.
          </p>
        ) : null}
      </div>
    </div>
  );
}
