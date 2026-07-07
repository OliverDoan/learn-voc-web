"use client";

import Link from "next/link";
import { BookOpenText, ChevronRight, Loader2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useStories } from "@/hooks/use-stories";

interface StoryListProps {
  deckId: string;
}

export function StoryList({ deckId }: StoryListProps) {
  const { data: stories, isLoading } = useStories(deckId);

  if (isLoading) {
    return (
      <div className="mb-6 flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Chưa có truyện: ô mời tạo truyện (viền đứt cho nhẹ)
  if (!stories || stories.length === 0) {
    return (
      <div className="mb-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed p-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpenText className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">Truyện chêm</p>
            <p className="text-sm text-muted-foreground">Học từ qua ngữ cảnh với truyện chêm.</p>
          </div>
        </div>
        <Link href={`/decks/${deckId}/stories/new`}>
          <Button size="sm">
            <Plus className="h-4 w-4" /> Tạo truyện
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-2">
      {stories.map((story) => (
        <motion.div key={story.id} whileHover={{ y: -1 }} transition={{ duration: 0.15 }}>
          <Link
            href={`/stories/${story.id}`}
            className="group flex items-center gap-3 rounded-2xl border border-dashed bg-card/60 px-4 py-3 transition-colors hover:border-primary/50 hover:bg-accent/40"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpenText className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-semibold">Truyện chêm</span>
                <span className="truncate text-sm text-muted-foreground">
                  {story.title} · {story._count.storyCards} từ
                </span>
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
              Mở truyện
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </motion.div>
      ))}

      <div className="flex justify-end">
        <Link href={`/decks/${deckId}/stories/new`}>
          <Button size="sm" variant="ghost" className="text-muted-foreground">
            <Plus className="h-4 w-4" /> Tạo truyện
          </Button>
        </Link>
      </div>
    </div>
  );
}
