"use client";

import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StatsSeriesPoint } from "@/hooks/use-progress";

const STATE_COLORS: Record<string, string> = {
  NEW: "#94a3b8",
  LEARNING: "#f59e0b",
  REVIEW: "#3b82f6",
  MATURE: "#22c55e",
  SUSPENDED: "#71717a",
};

const STATE_LABELS: Record<string, string> = {
  NEW: "Mới",
  LEARNING: "Đang học",
  REVIEW: "Ôn tập",
  MATURE: "Thuộc",
  SUSPENDED: "Tạm dừng",
};

export function ReviewedBarChart({ series }: { series: StatsSeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={series.slice(-30)}>
        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d: string) => d.slice(5)} />
        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="reviewed" name="Đã ôn" fill="#3b82f6" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StateDistributionPie({
  data,
}: {
  data: Array<{ state: string; count: number }>;
}) {
  const pieData = data.map((d) => ({
    name: STATE_LABELS[d.state] ?? d.state,
    value: d.count,
    color: STATE_COLORS[d.state] ?? "#a3a3a3",
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
          {pieData.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function AccuracyLineChart({ series }: { series: StatsSeriesPoint[] }) {
  const data = series.slice(-30).map((p) => ({
    date: p.date.slice(5),
    accuracy: p.total === 0 ? 0 : Math.round((p.correct / p.total) * 100),
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="accuracy"
          name="Tỷ lệ đúng (%)"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
