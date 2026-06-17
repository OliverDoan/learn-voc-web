"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Eye, EyeOff, Pencil, Square, Target, Trash2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { StoryRenderer } from "@/components/story/story-renderer";
import { useDeleteStory, useMarkStoryRead, useStory } from "@/hooks/use-stories";
import { countWordTokens, parseStory } from "@/lib/story-parser";
import { speakAsync, stopSpeaking } from "@/lib/tts";

interface PageProps {
  params: Promise<{ storyId: string }>;
}

export default function StoryViewPage({ params }: PageProps) {
  const { storyId } = use(params);
  const router = useRouter();
  const [showMeanings, setShowMeanings] = useState(false);
  const [hideWords, setHideWords] = useState(false);
  const [marked, setMarked] = useState(false);
  const [reading, setReading] = useState(false);
  const readCancelRef = useRef(false);

  const { data: story, isLoading } = useStory(storyId);
  const markRead = useMarkStoryRead();
  const deleteStory = useDeleteStory();
  const { confirm, confirmDialog } = useConfirm();

  useEffect(
    () => () => {
      readCancelRef.current = true;
      stopSpeaking();
    },
    [],
  );

  // Đọc truyện đúng ngôn ngữ: phần văn tiếng Việt (vi-VN), từ chêm tiếng Anh (en-US).
  const handleReadAloud = async () => {
    if (!story) return;
    if (reading) {
      readCancelRef.current = true;
      stopSpeaking();
      setReading(false);
      return;
    }
    readCancelRef.current = false;
    setReading(true);
    const tokens = parseStory(story.content);
    for (const tok of tokens) {
      if (readCancelRef.current) break;
      if (tok.type === "text") {
        const text = tok.text.trim();
        if (text) await speakAsync(text, "vi-VN", 0.95);
      } else {
        await speakAsync(tok.word, "en-US", 0.95);
      }
    }
    if (!readCancelRef.current) setReading(false);
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
    if (!story) return;
    const ok = await confirm({
      title: `Xoá truyện "${story.title}"?`,
      description: "Truyện chêm sẽ bị xoá. Hành động này không thể hoàn tác.",
    });
    if (!ok) return;
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

      <div className="mb-6 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <BookOpen className="h-6 w-6" />
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{story.title}</h1>
        <div className="font-mono mt-2 text-[13px] uppercase tracking-wider text-muted-foreground">
          {wordCount} từ chêm · {story.readCount} lần đọc
        </div>
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        <Button
          variant={reading ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={handleReadAloud}
        >
          {reading ? <Square className="h-4 w-4 fill-current" /> : <Volume2 className="h-4 w-4" />}
          {reading ? "Dừng" : "Đọc to"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setShowMeanings(!showMeanings)}
        >
          {showMeanings ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showMeanings ? "Ẩn nghĩa" : "Hiện nghĩa"}
        </Button>
        <Button
          variant={hideWords ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => setHideWords(!hideWords)}
        >
          <Target className="h-4 w-4" />
          {hideWords ? "Hiện từ" : "Ẩn từ chêm"}
        </Button>
        <Link href={`/stories/${storyId}/fill`}>
          <Button variant="secondary" size="sm" className="rounded-full">
            Quiz điền từ
          </Button>
        </Link>
      </div>

      <article className="rounded-2xl border bg-card p-8 shadow-[0_24px_64px_rgba(0,13,139,.08)] md:px-12">
        <StoryRenderer
          content={story.content}
          showMeanings={showMeanings}
          hideWords={hideWords}
        />
        <div className="font-mono mt-8 flex flex-wrap items-center justify-center gap-2 text-[12.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-primary/15 [border-bottom:2px_solid_var(--primary)]" />
            từ vựng chêm
          </span>
          <span>·</span>
          <span>chạm vào từ để xem nghĩa &amp; nghe phát âm</span>
        </div>
      </article>

      <div className="mt-6 flex justify-center">
        <Button
          size="lg"
          className="rounded-full px-8 shadow-[0_8px_20px_rgba(23,61,201,.28)]"
          onClick={handleMarkRead}
          disabled={marked || markRead.isPending}
        >
          {marked ? "Đã đánh dấu" : "Đã đọc xong (+10 XP)"}
        </Button>
      </div>
      {confirmDialog}
    </div>
  );
}
