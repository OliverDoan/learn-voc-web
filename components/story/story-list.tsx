"use client";

import Link from "next/link";
import { BookOpen, Eye, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStories } from "@/hooks/use-stories";

interface StoryListProps {
  deckId: string;
}

export function StoryList({ deckId }: StoryListProps) {
  const { data: stories, isLoading } = useStories(deckId);

  return (
    <div className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">⭐ Truyện chêm</h2>
        <Link href={`/decks/${deckId}/stories/new`}>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4" /> Tạo truyện
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      ) : !stories || stories.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="mb-3 text-sm text-muted-foreground">
            Học từ qua ngữ cảnh với truyện chêm.
          </p>
          <Link href={`/decks/${deckId}/stories/new`}>
            <Button size="sm">Tạo truyện đầu tiên</Button>
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {stories.map((story) => (
            <motion.li
              key={story.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
            >
              <Link
                href={`/stories/${story.id}`}
                className="block rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
              >
                {story.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="mb-3 h-32 w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="mb-3 flex h-32 w-full items-center justify-center rounded-md bg-primary/10 text-4xl">
                    📖
                  </div>
                )}
                <h3 className="font-semibold">{story.title}</h3>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-[10px]">
                    <BookOpen className="mr-1 h-3 w-3" />
                    {story._count.storyCards} từ
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {story.readCount}
                  </span>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
