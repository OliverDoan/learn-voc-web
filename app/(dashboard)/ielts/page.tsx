import Link from "next/link";
import { ArrowRight, Clock, GraduationCap, Target, Trophy } from "lucide-react";
import { IELTS_OVERVIEW, IELTS_SKILLS } from "@/lib/ielts-content";

export const metadata = {
  title: "IELTS — VocaLearn",
  description: "Hướng dẫn ôn IELTS 4 skill cho band 5.0 – 6.5",
};

export default function IeltsOverviewPage() {
  const skills = Object.values(IELTS_SKILLS);

  return (
    <div className="container mx-auto max-w-5xl space-y-8 p-6">
      <header className="rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-6">
        <div className="mb-3 flex items-center gap-3">
          <div className="rounded-xl bg-primary/15 p-2 text-primary">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">IELTS</h1>
            <p className="text-sm text-muted-foreground">
              International English Language Testing System
            </p>
          </div>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          IELTS đánh giá 4 kỹ năng tiếng Anh — Nghe, Đọc, Viết, Nói — chấm theo
          thang 0–9 band. Trang này hệ thống lại format đề thi và đề xuất lộ
          trình ôn 8 tuần cho mục tiêu <strong>band 5.0 – 6.5</strong>.
        </p>
      </header>

      {/* Overview cards */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Thời gian thi"
          value="~2h 45'"
          sub={IELTS_OVERVIEW.totalDuration}
        />
        <StatCard
          icon={<Target className="h-4 w-4" />}
          label="Mục tiêu"
          value="6.0 – 6.5"
          sub="Band Competent — đủ học đại học"
        />
        <StatCard
          icon={<Trophy className="h-4 w-4" />}
          label="Cách chấm"
          value="0 – 9"
          sub="Overall = trung bình 4 skill, làm tròn 0.5"
        />
      </section>

      {/* Test formats */}
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="mb-3 text-lg font-semibold">Hai loại bài thi</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {IELTS_OVERVIEW.testFormats.map((f) => (
            <div
              key={f.type}
              className="rounded-xl border bg-background p-4"
            >
              <h3 className="font-semibold text-primary">{f.type}</h3>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                Dành cho
              </p>
              <p className="text-sm">{f.purpose}</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                Khác biệt
              </p>
              <p className="text-sm text-muted-foreground">{f.diffs}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4 skills */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">4 kỹ năng IELTS</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {skills.map((s) => (
            <Link
              key={s.id}
              href={`/ielts/${s.id}`}
              className="group rounded-2xl border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-3xl">{s.icon}</span>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <h3 className="font-semibold">
                {s.name}{" "}
                <span className="text-sm text-muted-foreground">
                  · {s.nameVi}
                </span>
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {s.duration} · {s.questionCount}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {s.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Band guide */}
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="mb-3 text-lg font-semibold">Thang band điểm</h2>
        <ul className="divide-y">
          {IELTS_OVERVIEW.bandGuide.map((b) => {
            const isTarget = b.band === "6.5";
            return (
              <li
                key={b.band}
                className={`flex items-center gap-3 py-2 ${
                  isTarget ? "rounded-md bg-primary/5 px-2" : ""
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                    isTarget
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {b.band}
                </span>
                <span className="text-sm">{b.level}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Cách ôn chung */}
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="mb-3 text-lg font-semibold">
          Nguyên tắc ôn hiệu quả (chung cho 4 skill)
        </h2>
        <ol className="ml-5 list-decimal space-y-2 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Đặt mục tiêu rõ:</strong> chọn
            band, deadline cụ thể. Mỗi skill cần chiến lược khác nhau.
          </li>
          <li>
            <strong className="text-foreground">Test chẩn đoán:</strong> làm 1
            full test Cambridge IELTS để biết band hiện tại trước khi vào kế
            hoạch.
          </li>
          <li>
            <strong className="text-foreground">Học từ vựng theo topic:</strong>{" "}
            ưu tiên 570 từ Academic Word List + 30 topic Speaking phổ biến. Dùng
            SRS để nhớ lâu (deck đã có sẵn trong app).
          </li>
          <li>
            <strong className="text-foreground">Luyện đề Cambridge:</strong>{" "}
            sách Cambridge IELTS 14–18 là chuẩn nhất. KHÔNG luyện đề chợ.
          </li>
          <li>
            <strong className="text-foreground">Phân tích lỗi:</strong> mỗi test
            xong, ghi rõ sai loại gì (vocab thiếu, paraphrasing, bẫy NG…) →
            không lặp lại.
          </li>
          <li>
            <strong className="text-foreground">Mock test áp lực thời gian:</strong>{" "}
            2 tuần cuối phải mock đúng timing thật, không pause.
          </li>
          <li>
            <strong className="text-foreground">Output có feedback:</strong>{" "}
            Writing và Speaking BẮT BUỘC có người/AI chấm — không tự đánh giá
            được.
          </li>
        </ol>
      </section>

      {/* Roadmap visual */}
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="mb-3 text-lg font-semibold">
          Lộ trình 8 tuần — target 6.0 – 6.5
        </h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
          {[
            { week: "Tuần 1–2", title: "Foundation", desc: "Format + AWL + diagnostic test" },
            { week: "Tuần 3–4", title: "Skill drill", desc: "Tập trung từng skill, vocab theo topic" },
            { week: "Tuần 5–6", title: "Strategy", desc: "Paraphrasing, time pressure, common traps" },
            { week: "Tuần 7–8", title: "Mock + tune", desc: "Full test/ngày + review lỗi" },
          ].map((p, i) => (
            <div
              key={p.week}
              className="rounded-xl border bg-background p-3 text-center"
            >
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {p.week}
              </p>
              <p className="my-1 font-semibold">
                {i + 1}. {p.title}
              </p>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Bấm vào từng skill ở trên để xem kế hoạch chi tiết.
        </p>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Phần luyện đề thực tế (Listening audio, Reading passage, Writing chấm
        AI, Speaking ghi âm) sẽ ra mắt ở các phase tiếp theo.
      </p>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}

function StatCard({ icon, label, value, sub }: StatCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
