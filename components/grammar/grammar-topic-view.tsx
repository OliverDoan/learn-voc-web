"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Dumbbell, Lightbulb, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GrammarPractice } from "@/components/grammar/grammar-practice";
import { useGrammarProgress } from "@/hooks/use-grammar-progress";
import { GRAMMAR_LEVEL_LABEL, type GrammarTopic } from "@/lib/grammar";

interface GrammarTopicViewProps {
  topic: GrammarTopic;
}

export function GrammarTopicView({ topic }: GrammarTopicViewProps) {
  const { recordScore } = useGrammarProgress();

  return (
    <div className="container mx-auto max-w-3xl space-y-6 p-6">
      <Link
        href="/grammar"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Tất cả chủ đề ngữ pháp
      </Link>

      <header className="rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-6">
        <div className="mb-2 flex items-center gap-3">
          <span className="text-4xl">{topic.icon}</span>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {GRAMMAR_LEVEL_LABEL[topic.level]}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold md:text-3xl">
              {topic.nameVi}{" "}
              <span className="text-base font-normal text-muted-foreground">· {topic.name}</span>
            </h1>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{topic.summary}</p>
      </header>

      {/* Lý thuyết */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <BookOpen className="h-5 w-5 text-primary" /> Lý thuyết
        </h2>
        {topic.rules.map((rule, i) => (
          <div key={i} className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold text-primary">{rule.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{rule.explanation}</p>
            <div className="mt-3 space-y-2">
              {rule.examples.map((ex, j) => (
                <div key={j} className="rounded-lg border bg-background p-3">
                  <p className="text-sm font-medium">{ex.en}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{ex.vi}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Lỗi thường gặp */}
      {topic.commonMistakes.length > 0 ? (
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <TriangleAlert className="h-5 w-5 text-amber-500" /> Lỗi thường gặp
          </h2>
          <ul className="space-y-2">
            {topic.commonMistakes.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <span className="text-muted-foreground">{m}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Luyện tập */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Dumbbell className="h-5 w-5 text-primary" /> Luyện tập ({topic.exercises.length} câu)
        </h2>
        <GrammarPractice
          exercises={topic.exercises}
          onFinish={(percent) => recordScore(topic.id, percent)}
        />
      </section>
    </div>
  );
}
