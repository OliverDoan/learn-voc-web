"use client";

import Link from "next/link";
import { BookText, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGrammarProgress } from "@/hooks/use-grammar-progress";
import {
  GRAMMAR_LEVEL_LABEL,
  GRAMMAR_LEVEL_ORDER,
  grammarTopicsByLevel,
} from "@/lib/grammar";

export default function GrammarPage() {
  const { progress } = useGrammarProgress();

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <BookText className="h-6 w-6 text-primary" /> Ngữ pháp
        </h1>
        <p className="text-sm text-muted-foreground">
          Học ngữ pháp tiếng Anh theo cấp độ — mỗi chủ đề có lý thuyết và bài tập luyện.
        </p>
      </div>

      <div className="space-y-8">
        {GRAMMAR_LEVEL_ORDER.map((level) => {
          const topics = grammarTopicsByLevel(level);
          if (topics.length === 0) return null;
          return (
            <section key={level}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {GRAMMAR_LEVEL_LABEL[level]}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {topics.map((topic) => {
                  const best = progress[topic.id]?.best;
                  return (
                    <Link
                      key={topic.id}
                      href={`/grammar/${topic.id}`}
                      className="flex flex-col rounded-2xl border bg-card p-4 transition-colors hover:border-primary"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <span className="text-3xl">{topic.icon}</span>
                        {best !== undefined ? (
                          <Badge variant={best >= 80 ? "success" : "secondary"} className="text-xs">
                            {best}%
                          </Badge>
                        ) : null}
                      </div>
                      <h3 className="font-semibold leading-snug">{topic.nameVi}</h3>
                      <p className="text-xs text-muted-foreground">{topic.name}</p>
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                        {topic.summary}
                      </p>
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <BookText className="h-3.5 w-3.5" /> {topic.rules.length} mục
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Dumbbell className="h-3.5 w-3.5" /> {topic.exercises.length} bài
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
