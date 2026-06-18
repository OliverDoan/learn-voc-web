"use client";

import { useEffect, useState } from "react";
import { Mic } from "lucide-react";
import {
  DIFFICULTY_OPTIONS,
  getPronounceDifficulty,
  setPronounceDifficulty,
  type PronounceDifficulty,
} from "@/lib/pronounce-settings";

/**
 * Cài đặt độ khó cho chức năng luyện phát âm. Lưu trực tiếp vào localStorage
 * (giống các preference client-side khác trong app).
 */
export function PronounceSection() {
  const [difficulty, setDifficulty] = useState<PronounceDifficulty>("normal");

  // Khôi phục giá trị đã lưu sau khi mount (tránh lệch SSR/CSR).
  useEffect(() => {
    setDifficulty(getPronounceDifficulty());
  }, []);

  const handleSelect = (level: PronounceDifficulty) => {
    setDifficulty(level);
    setPronounceDifficulty(level);
  };

  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Mic className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Độ khó luyện phát âm</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Chọn mức độ chấm điểm khi luyện phát âm. Mức càng thấp càng dễ qua, phù
        hợp khi mới bắt đầu.
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        {DIFFICULTY_OPTIONS.map((opt) => {
          const active = difficulty === opt.level;
          return (
            <button
              key={opt.level}
              type="button"
              onClick={() => handleSelect(opt.level)}
              aria-pressed={active}
              className={`rounded-xl border p-3 text-left transition-colors ${
                active
                  ? "border-primary bg-primary/10"
                  : "border-input hover:border-primary/50"
              }`}
            >
              <div
                className={`text-sm font-semibold ${
                  active ? "text-primary" : "text-foreground"
                }`}
              >
                {opt.label}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {opt.description}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
