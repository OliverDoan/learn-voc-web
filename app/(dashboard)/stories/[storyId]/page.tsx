"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Pencil, Target, Trash2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoryRenderer } from "@/components/story/story-renderer";
import { useDeleteStory, useMarkStoryRead, useStory } from "@/hooks/use-stories";
import { countWordTokens, plainText } from "@/lib/story-parser";
import { speak, stopSpeaking } from "@/lib/tts";

interface PageProps {
  params: Promise<{ storyId: string }>;
}

export default function StoryViewPage({ params }: PageProps) {
  const { storyId } = use(params);
  const router = useRouter();
  const [showMeanings, setShowMeanings] = useState(false);
  const [hideWords, setHideWords] = useState(false);
  const [marked, setMarked] = useState(false);

  const { data: story, isLoading } = useStory(storyId);
  const markRead = useMarkStoryRead();
  const deleteStory = useDeleteStory();

  useEffect(() => () => stopSpeaking(), []);

  const handleReadAloud = () => {
    if (!story) return;
    speak(plainText(story.content), "en-US", 0.9);
  };

  const handleMarkRead = async () => {
    if (marked) return;
    try {
      await markRead.mutateAsync(storyId);
      setMarked(true);
      toast.success("Đã đánh dấu đọc xong!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi");
    }
  };

  const handleDelete = async () => {
    if (!story || !confirm(`Xoá truyện "${story.title}"?`)) return;
    try {
      await deleteStory.mutateAsync(storyId);
      toast.success("Đã xoá truyện");
      router.push(`/decks/${story.deckId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi");
    }
  };

  if (isLoading) {
    return <div className="p-6">Đang tải...</div>;
  }
  if (!story) {
    return <div className="p-6">Không tìm thấy truyện</div>;
  }

  const wordCount = countWordTokens(story.content);

  return (
    <div className="container mx-auto max-w-3xl p-6 pb-24">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/decks/${story.deckId}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
        <div className="flex gap-2">
          <Link href={`/stories/${storyId}/edit`}>
            <Button variant="outline" size="icon" aria-label="Sửa">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" size="icon" onClick={handleDelete} aria-label="Xoá">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {story.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={story.imageUrl}
          alt={story.title}
          className="mb-6 max-h-[300px] w-full rounded-xl object-cover shadow-md"
        />
      ) : null}

      <h1 className="mb-2 text-3xl font-bold">{story.title}</h1>
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary">{wordCount} từ chêm</Badge>
        <span>·</span>
        <span>{story.readCount} lần đọc</span>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleReadAloud}>
          <Volume2 className="h-4 w-4" /> Đọc to
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMeanings(!showMeanings)}
        >
          {showMeanings ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showMeanings ? "Ẩn nghĩa" : "Hiện nghĩa"}
        </Button>
        <Button
          variant={hideWords ? "default" : "outline"}
          size="sm"
          onClick={() => setHideWords(!hideWords)}
        >
          <Target className="h-4 w-4" />
          {hideWords ? "Hiện từ" : "Ẩn từ chêm"}
        </Button>
        <Link href={`/stories/${storyId}/fill`}>
          <Button variant="secondary" size="sm">
            Quiz điền từ
          </Button>
        </Link>
      </div>

      <article className="rounded-xl border bg-card p-6">
        <StoryRenderer
          content={story.content}
          showMeanings={showMeanings}
          hideWords={hideWords}
        />
      </article>

      <div className="mt-6 flex justify-center">
        <Button size="lg" onClick={handleMarkRead} disabled={marked || markRead.isPending}>
          {marked ? "Đã đánh dấu" : "Đã đọc xong (+10 XP)"}
        </Button>
      </div>
    </div>
  );
}
