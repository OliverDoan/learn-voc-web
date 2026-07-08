"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  MISTAKES,
  MISTAKE_TYPE_COLOR,
  type MistakeType,
} from "@/lib/mistakes-data";

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
} as const;

/**
 * Dashboard nhỏ ở trang lỗi: phân bố theo loại lỗi (donut) + số lỗi theo Unit (bar),
 * giúp nhận ra sai chủ yếu ở loại nào / unit nào.
 */
export function MistakesCharts() {
  const byType = useMemo(() => {
    const map = new Map<MistakeType, number>();
    for (const m of MISTAKES) map.set(m.type, (map.get(m.type) ?? 0) + 1);
    return Array.from(map.entries())
      .map(([type, count]) => ({ type, count, color: MISTAKE_TYPE_COLOR[type] }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const byUnit = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, number>();
    for (const m of MISTAKES) {
      if (!map.has(m.unit)) {
        map.set(m.unit, 0);
        order.push(m.unit);
      }
      map.set(m.unit, map.get(m.unit)! + 1);
    }
    return order.map((unit) => ({ unit, count: map.get(unit)! }));
  }, []);

  const total = MISTAKES.length;
  const top = byType[0];

  if (total === 0) return null;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Phân bố theo loại lỗi */}
      <div className="rounded-2xl border bg-card p-4">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold">Theo loại lỗi</h2>
          {top ? (
            <span className="text-xs text-muted-foreground">
              Nhiều nhất:{" "}
              <strong style={{ color: top.color }}>
                {top.type} ({top.count})
              </strong>
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative h-[160px] w-[160px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byType}
                  dataKey="count"
                  nameKey="type"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                >
                  {byType.map((d) => (
                    <Cell key={d.type} fill={d.color} stroke="var(--card)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold leading-none">{total}</span>
              <span className="text-[11px] text-muted-foreground">lỗi</span>
            </div>
          </div>
          {/* Chú thích + số lượng */}
          <ul className="min-w-0 flex-1 space-y-1.5">
            {byType.map((d) => (
              <li key={d.type} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{d.type}</span>
                <span className="shrink-0 font-mono font-semibold">{d.count}</span>
                <span className="w-9 shrink-0 text-right text-xs text-muted-foreground">
                  {Math.round((d.count / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Số lỗi theo Unit */}
      <div className="rounded-2xl border bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold">Theo Unit</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={byUnit} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="unit"
              tick={{ fontSize: 10 }}
              tickFormatter={(u: string) => u.replace("Unit ", "U")}
            />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)" }} />
            <Bar dataKey="count" name="Số lỗi" fill="#f43f5e" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
