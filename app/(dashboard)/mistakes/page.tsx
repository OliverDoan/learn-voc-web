"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { MISTAKES, mistakeTypeClass, type MistakeRow, type MistakeType } from "@/lib/mistakes-data";
import { MistakesCharts } from "@/components/mistakes/mistakes-charts";

interface UnitGroup {
  unit: string;
  rows: MistakeRow[];
}

/** Lấy phần trong ngoặc "word (n)" → "n". Null nếu không có. */
function extractPos(s: string | null): string | null {
  if (!s) return null;
  const m = s.match(/\(([^)]+)\)/);
  return m ? m[1].trim() : null;
}

export default function MistakesPage() {
  // Lọc theo loại lỗi (null = tất cả)
  const [typeFilter, setTypeFilter] = useState<MistakeType | null>(null);

  // Các loại lỗi thực sự xuất hiện (giữ thứ tự xuất hiện) + số lượng.
  const typeCounts = useMemo(() => {
    const map = new Map<MistakeType, number>();
    for (const m of MISTAKES) map.set(m.type, (map.get(m.type) ?? 0) + 1);
    return Array.from(map.entries()).map(([type, count]) => ({ type, count }));
  }, []);

  const rows = useMemo(
    () => (typeFilter ? MISTAKES.filter((m) => m.type === typeFilter) : MISTAKES),
    [typeFilter],
  );

  // Gom theo Unit, giữ nguyên thứ tự xuất hiện.
  const groups = useMemo<UnitGroup[]>(() => {
    const order: string[] = [];
    const map = new Map<string, MistakeRow[]>();
    for (const r of rows) {
      if (!map.has(r.unit)) {
        map.set(r.unit, []);
        order.push(r.unit);
      }
      map.get(r.unit)!.push(r);
    }
    return order.map((unit) => ({ unit, rows: map.get(unit)! }));
  }, [rows]);

  return (
    <div className="container mx-auto max-w-4xl p-6 pb-28">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
          <CircleAlert className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Xem lỗi sai</h1>
          <p className="text-sm text-muted-foreground">
            Tổng hợp các câu trả lời sai · {MISTAKES.length} lỗi
          </p>
        </div>
      </div>

      <MistakesCharts />

      {/* Lọc theo loại lỗi */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setTypeFilter(null)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            typeFilter === null
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          Tất cả ({MISTAKES.length})
        </button>
        {typeCounts.map(({ type, count }) => (
          <button
            key={type}
            type="button"
            onClick={() => setTypeFilter((prev) => (prev === type ? null : type))}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              typeFilter === type
                ? mistakeTypeClass(type)
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {type} ({count})
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Loại lỗi</th>
              <th className="px-4 py-3">Bạn trả lời</th>
              <th className="px-4 py-3">Đúng</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) =>
              group.rows.map((row, i) => {
                // Lỗi từ loại: chỉ hiện "từ loại sai → từ loại đúng" ở cột Bạn trả lời.
                const wrongPos = row.type === "Từ loại" ? extractPos(row.answer) : null;
                const rightPos = row.type === "Từ loại" ? extractPos(row.correct) : null;
                // Chỉ rút gọn thành "sai → đúng" khi từ loại thực sự khác nhau
                // (nếu POS giống nhau thì lỗi nằm ở từ, giữ nguyên câu trả lời).
                const posOnly = Boolean(wrongPos && rightPos && wrongPos !== rightPos);
                return (
                  <tr
                    key={`${group.unit}-${i}`}
                    className={cn(
                      "border-t align-middle transition-colors hover:bg-accent/40",
                      i === 0 && "border-t-2",
                    )}
                  >
                    {i === 0 ? (
                      <td
                        rowSpan={group.rows.length}
                        className="whitespace-nowrap border-r px-4 py-3 align-top font-bold"
                      >
                        {group.unit}
                      </td>
                    ) : null}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                          mistakeTypeClass(row.type),
                        )}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {posOnly ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="font-medium text-rose-600 line-through decoration-rose-400/50 dark:text-rose-300">
                            ({wrongPos})
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            ({rightPos})
                          </span>
                        </span>
                      ) : row.answer ? (
                        <span className="font-medium text-rose-600 line-through decoration-rose-400/50 dark:text-rose-300">
                          {row.answer}
                        </span>
                      ) : (
                        <span className="italic text-muted-foreground">(không trả lời)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
                        {row.correct}
                      </span>
                    </td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
