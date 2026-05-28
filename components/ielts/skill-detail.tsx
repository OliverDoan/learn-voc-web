import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Hash,
  ListChecks,
  Lightbulb,
} from "lucide-react";
import type { IeltsSkillInfo } from "@/lib/ielts-content";

interface SkillDetailPageProps {
  skill: IeltsSkillInfo;
}

export function SkillDetailPage({ skill }: SkillDetailPageProps) {
  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <Link
        href="/ielts"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Về tổng quan IELTS
      </Link>

      <header className="rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-6">
        <div className="mb-2 flex items-center gap-3">
          <span className="text-4xl">{skill.icon}</span>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              {skill.name}{" "}
              <span className="text-base font-normal text-muted-foreground">
                · {skill.nameVi}
              </span>
            </h1>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {skill.description}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <InfoRow icon={<Clock className="h-4 w-4" />} label="Thời gian">
            {skill.duration}
          </InfoRow>
          <InfoRow icon={<Hash className="h-4 w-4" />} label="Số câu">
            {skill.questionCount}
          </InfoRow>
          <InfoRow icon={<ListChecks className="h-4 w-4" />} label="Cấu trúc">
            {skill.format}
          </InfoRow>
        </div>
      </header>

      {/* Parts */}
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="mb-3 text-lg font-semibold">Các phần trong đề thi</h2>
        <div className="space-y-3">
          {skill.parts.map((p) => (
            <div
              key={p.title}
              className="rounded-xl border bg-background p-4"
            >
              <h3 className="font-semibold text-primary">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Question types */}
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="mb-3 text-lg font-semibold">Dạng câu hỏi thường gặp</h2>
        <ul className="space-y-2">
          {skill.questionTypes.map((q) => (
            <li key={q} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{q}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Tips */}
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Mẹo ôn hiệu quả
        </h2>
        <ul className="space-y-2">
          {skill.tips.map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-500/15 text-xs font-bold text-yellow-600 dark:text-yellow-400">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{t}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Weekly plan */}
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Calendar className="h-5 w-5 text-primary" />
          Lộ trình 8 tuần (band 5.0 – 6.5)
        </h2>
        <div className="space-y-3">
          {skill.weeklyPlan.map((w) => (
            <div
              key={w.week}
              className="rounded-xl border bg-background p-4"
            >
              <div className="mb-1 flex flex-wrap items-baseline gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {w.week}
                </span>
                <h3 className="font-semibold">{w.goal}</h3>
              </div>
              <ul className="ml-4 mt-2 list-disc space-y-1 text-sm text-muted-foreground">
                {w.tasks.map((task, i) => (
                  <li key={i}>{task}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-dashed bg-card/50 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          🚧 Phần luyện đề tương tác cho <strong>{skill.name}</strong> đang
          được phát triển ở phase tiếp theo.
        </p>
      </div>
    </div>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

function InfoRow({ icon, label, children }: InfoRowProps) {
  return (
    <div className="rounded-xl border bg-background/60 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-sm">{children}</p>
    </div>
  );
}
