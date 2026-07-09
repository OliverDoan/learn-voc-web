"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Eye, EyeOff, Lightbulb, Volume2 } from "lucide-react";
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

  const entries = useMemo(() => {
    const q = norm(query);
    if (!q) return CONFUSING_ENTRIES;
    return CONFUSING_ENTRIES.filter((e) =>
      e.terms.some((t) => norm(t.word).includes(q) || norm(t.note).includes(q)),
    );
  }, [query]);

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

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="overflow-hidden rounded-2xl border">
            {/* Điểm khác nhau cốt lõi */}
            <div className="flex items-start gap-3 border-b bg-muted/30 px-4 py-3">
              <span className="text-2xl leading-none">{entry.icon}</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold">
                  {entry.terms.map((t, i) => (
                    <span key={t.word} className="flex items-center gap-2">
                      {i > 0 ? (
                        <span className="text-muted-foreground">vs</span>
                      ) : null}
                      <span className="text-primary">{t.word}</span>
                    </span>
                  ))}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{entry.difference}</p>
              </div>
            </div>

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
        ))}

        {entries.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Không tìm thấy từ nào khớp “{query}”.
          </p>
        ) : null}
      </div>
    </div>
  );
}
