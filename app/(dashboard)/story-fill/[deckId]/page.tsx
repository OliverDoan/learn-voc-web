"use client";

import { use, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";
import { useStories } from "@/hooks/use-stories";
import { countWordTokens } from "@/lib/story-parser";

interface PageProps {
  params: Promise<{ deckId: string }>;
}

/**
 * Trang trung gian cho dạng "Điền truyện chêm" của deck:
 * - 1 truyện có từ chêm → chuyển thẳng vào bài điền từ.
 * - Nhiều truyện → danh sách chọn truyện muốn làm.
 */
export default function StoryFillPickerPage({ params }: PageProps) {
  const { deckId } = use(params);
  const router = useRouter();
  const { data: stories, isLoading } = useStories(deckId);

  // Chỉ những truyện có từ chêm mới điền được.
  const fillable = useMemo(
    () =>
      (stories ?? [])
        .map((s) => ({ ...s, wordCount: countWordTokens(s.content) }))
        .filter((s) => s.wordCount > 0),
    [stories],
  );

  // Đúng 1 truyện → vào thẳng bài điền từ, khỏi phải chọn.
  useEffect(() => {
    if (!isLoading && fillable.length === 1) {
      router.replace(`/stories/${fillable[0].id}/fill`);
    }
  }, [isLoading, fillable, router]);

  if (isLoading || fillable.length === 1) {
    return <PageLoader className="min-h-[40vh]" />;
  }

  return (
    <div className="container mx-auto max-w-xl p-6">
      <Link
        href={`/decks/${deckId}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại deck
      </Link>

      <h1 className="mb-2 text-2xl font-bold">Điền truyện chêm</h1>

      {fillable.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Deck này chưa có truyện chêm nào chứa từ chêm để làm bài.
          </p>
          <Link href={`/decks/${deckId}`} className="mt-4 inline-block">
            <Button variant="outline" className="rounded-full">Quay lại</Button>
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-6 text-sm text-muted-foreground">
            Chọn truyện muốn làm bài điền từ:
          </p>
          <ul className="space-y-3">
            {fillable.map((story) => (
              <li key={story.id}>
                <Link
                  href={`/stories/${story.id}/fill`}
                  className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <PenLine className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{story.title}</span>
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <BookOpen className="h-3 w-3" /> {story.wordCount} từ chêm
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
