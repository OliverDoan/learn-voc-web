"use client";

import { useState } from "react";
import { History, ListChecks, XCircle } from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";
import { WrongCardsReview } from "@/components/history/wrong-cards-review";
import { AttemptsTimeline } from "@/components/history/attempts-timeline";
import { useHistory } from "@/hooks/use-history";
import { cn } from "@/lib/utils";

type Tab = "wrong" | "timeline";

export default function HistoryPage() {
  const { data, isLoading } = useHistory();
  const [tab, setTab] = useState<Tab>("wrong");

  const wrongCount = data?.wrongCards.length ?? 0;
  const attemptCount = data?.attempts.length ?? 0;

  return (
    <div className="container mx-auto max-w-3xl p-6 pb-24">
      <div className="mb-6 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <History className="h-6 w-6" />
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Lịch sử làm bài</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Xem lại các lượt đã làm và ôn tập những từ hay sai
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setTab("wrong")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            tab === "wrong"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          <XCircle className="h-4 w-4" /> Câu sai cần ôn
          {wrongCount > 0 ? <span className="font-mono text-xs">({wrongCount})</span> : null}
        </button>
        <button
          type="button"
          onClick={() => setTab("timeline")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            tab === "timeline"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          <ListChecks className="h-4 w-4" /> Lịch sử
          {attemptCount > 0 ? <span className="font-mono text-xs">({attemptCount})</span> : null}
        </button>
      </div>

      {isLoading || !data ? (
        <PageLoader className="min-h-[40vh]" />
      ) : tab === "wrong" ? (
        <WrongCardsReview cards={data.wrongCards} />
      ) : (
        <AttemptsTimeline attempts={data.attempts} />
      )}
    </div>
  );
}
