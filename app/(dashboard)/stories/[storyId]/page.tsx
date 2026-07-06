"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Eye, EyeOff, Languages, Pencil, Square, Target, Trash2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { PageLoader } from "@/components/ui/page-loader";
import { StoryRenderer } from "@/components/story/story-renderer";
import { ReadingSpeedControl } from "@/components/story/reading-speed-control";
import { useDeleteStory, useStories, useStory } from "@/hooks/use-stories";
import { useFavorites } from "@/hooks/use-cards";
import { useReadingRate } from "@/hooks/use-reading-rate";
import { countWordTokens, firstMeaning, parseStory } from "@/lib/story-parser";
import { isSpeakable, speakAsync, stopSpeaking } from "@/lib/tts";

interface PageProps {
  params: Promise<{ storyId: string }>;
}

// Lấy số thứ tự Unit từ tên deck ("Unit 10: ..." → 10) để sắp xếp truyện theo mạch.
function unitOrder(name: string): number {
  const match = name.match(/unit\s*(\d+)/i);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

export default function StoryViewPage({ params }: PageProps) {
  const { storyId } = use(params);
  const router = useRouter();
  const [showMeanings, setShowMeanings] = useState(false);
  const [hideWords, setHideWords] = useState(false);
  // Chế độ đọc: "mixed" (văn Việt + từ chêm tiếng Anh) | "vi" (đọc toàn bộ tiếng Việt) | null
  const [readMode, setReadMode] = useState<"mixed" | "vi" | null>(null);
  // Mỗi lần bắt đầu/huỷ đọc tăng generation để vòng đọc cũ tự dừng, tránh đọc chồng.
  const readGenRef = useRef(0);
  const { rate, setRate } = useReadingRate();
  // Ref để vòng đọc đang chạy luôn thấy tốc độ mới nhất khi người dùng đổi giữa chừng
  const rateRef = useRef(rate);
  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  const { data: story, isLoading } = useStory(storyId);
  // Toàn bộ truyện (mọi deck) để điều hướng sang truyện kế tiếp, kể cả khi deck chỉ có 1 truyện.
  const { data: allStories } = useStories();
  const { data: favorites } = useFavorites();

  // Truyện tiếp theo theo đúng thứ tự trang "Tất cả truyện" (Unit tăng dần, rồi createdAt);
  // quay vòng về đầu khi đang ở truyện cuối.
  const nextStory = useMemo(() => {
    if (!allStories || allStories.length < 2) return null;
    const ordered = [...allStories].sort((a, b) => {
      const diff = unitOrder(a.deck.name) - unitOrder(b.deck.name);
      if (diff !== 0) return diff;
      return a.createdAt.localeCompare(b.createdAt);
    });
    const idx = ordered.findIndex((s) => s.id === storyId);
    if (idx === -1) return null;
    return ordered[(idx + 1) % ordered.length];
  }, [allStories, storyId]);

  const handleGoNext = () => {
    if (!nextStory) return;
    // Dừng đọc trước khi chuyển truyện để không đọc chồng nội dung.
    readGenRef.current++;
    stopSpeaking();
    router.push(`/stories/${nextStory.id}`);
  };
  // Tập từ được đánh dấu sao (viết thường) để tô màu khác trong truyện.
  const favoriteWords = useMemo(
    () => new Set((favorites ?? []).map((c) => c.word.trim().toLowerCase())),
    [favorites],
  );
  const deleteStory = useDeleteStory();
  const { confirm, confirmDialog } = useConfirm();

  useEffect(
    () => () => {
      readGenRef.current++;
      stopSpeaking();
    },
    [],
  );

  // Đọc truyện theo chế độ:
  // - "mixed": văn tiếng Việt (vi-VN) + từ chêm đọc tiếng Anh (en-US)
  // - "vi": đọc toàn bộ bằng tiếng Việt, từ chêm đọc nghĩa tiếng Việt (nghĩa đầu tiên)
  const startReading = async (mode: "mixed" | "vi") => {
    if (!story) return;
    // Bấm lại đúng nút đang đọc → dừng.
    if (readMode === mode) {
      readGenRef.current++;
      stopSpeaking();
      setReadMode(null);
      return;
    }
    // Bắt đầu (hoặc chuyển) chế độ đọc — huỷ vòng đọc cũ bằng generation mới.
    const gen = ++readGenRef.current;
    stopSpeaking();
    setReadMode(mode);
    const tokens = parseStory(story.content);
    for (const tok of tokens) {
      if (readGenRef.current !== gen) return; // đã bị huỷ hoặc đổi chế độ
      if (tok.type === "text") {
        const text = tok.text.trim();
        if (isSpeakable(text)) await speakAsync(text, "vi-VN", rateRef.current);
      } else if (mode === "vi") {
        await speakAsync(firstMeaning(tok.meaning), "vi-VN", rateRef.current);
      } else {
        await speakAsync(tok.word, "en-US", rateRef.current);
      }
    }
    if (readGenRef.current === gen) setReadMode(null);
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
    return <PageLoader />;
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
        <ImageLightbox
          src={story.imageUrl}
          alt={story.title}
          className="mb-6 w-full rounded-xl shadow-md"
          imgClassName="h-auto w-full object-contain"
        />
      ) : null}

      <div className="mb-6 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <BookOpen className="h-6 w-6" />
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{story.title}</h1>
        <div className="font-mono mt-2 text-[13px] uppercase tracking-wider text-muted-foreground">
          {wordCount} từ chêm
        </div>
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        <Button
          variant={readMode === "mixed" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => startReading("mixed")}
        >
          {readMode === "mixed" ? (
            <Square className="h-4 w-4 fill-current" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
          {readMode === "mixed" ? "Dừng" : "Đọc to"}
        </Button>
        <Button
          variant={readMode === "vi" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => startReading("vi")}
        >
          {readMode === "vi" ? (
            <Square className="h-4 w-4 fill-current" />
          ) : (
            <Languages className="h-4 w-4" />
          )}
          {readMode === "vi" ? "Dừng" : "Đọc tiếng Việt"}
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
        <ReadingSpeedControl rate={rate} onChange={setRate} />
        {nextStory ? (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={handleGoNext}
          >
            Truyện tiếp theo
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <article className="rounded-2xl border bg-card p-8 shadow-[0_24px_64px_rgba(0,13,139,.08)] md:px-12">
        <StoryRenderer
          content={story.content}
          showMeanings={showMeanings}
          hideWords={hideWords}
          favoriteWords={favoriteWords}
        />
        <div className="font-mono mt-8 flex flex-wrap items-center justify-center gap-2 text-[12.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-primary/15 [border-bottom:2px_solid_var(--primary)]" />
            từ vựng chêm
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-amber-400/20 [border-bottom:2px_solid_rgb(245,158,11)]" />
            từ yêu thích
          </span>
          <span>·</span>
          <span>chạm vào từ để xem nghĩa &amp; nghe phát âm</span>
        </div>
      </article>

      {nextStory ? (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={handleGoNext}
          >
            Truyện tiếp theo: {nextStory.title}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      {confirmDialog}
    </div>
  );
}
