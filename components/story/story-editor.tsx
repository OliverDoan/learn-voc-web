"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StoryRenderer } from "./story-renderer";
import { useCards } from "@/hooks/use-cards";
import { useCreateStory, useUpdateStory } from "@/hooks/use-stories";
import { countWordTokens, extractWords } from "@/lib/story-parser";
import { fileToStoryImageDataUrl } from "@/lib/image";
import type { StoryWithCards } from "@/lib/types";

interface StoryEditorProps {
  deckId: string;
  story?: StoryWithCards;
  onDone?: (storyId: string) => void;
  onCancel?: () => void;
}

export function StoryEditor({ deckId, story, onDone, onCancel }: StoryEditorProps) {
  const isEdit = !!story;
  const [title, setTitle] = useState(story?.title ?? "");
  const [content, setContent] = useState(story?.content ?? "");
  const [contentEn, setContentEn] = useState(story?.contentEn ?? "");
  const [imageUrl, setImageUrl] = useState(story?.imageUrl ?? "");
  const [imageLoading, setImageLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { data: cards } = useCards({ deckId });
  const createMut = useCreateStory();
  const updateMut = useUpdateStory(story?.id ?? "");

  const usedWords = useMemo(() => {
    const set = new Set(extractWords(content).map((w) => w.word.toLowerCase()));
    return set;
  }, [content]);

  const insertWord = (word: string, meaning: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const tag = `[[${word}|${meaning}]]`;
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const next = content.slice(0, start) + tag + content.slice(end);
    setContent(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  // Chọn ảnh từ máy → giữ nguyên khung ảnh gốc, chỉ nén & resize bề rộng rồi lưu.
  const handlePickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset để chọn lại cùng file vẫn kích hoạt onChange
    if (!file) return;
    setImageLoading(true);
    try {
      const dataUrl = await fileToStoryImageDataUrl(file);
      setImageUrl(dataUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi xử lý ảnh");
    } finally {
      setImageLoading(false);
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  const handleSubmit = async () => {
    if (!title.trim()) return toast.error("Tiêu đề không được trống");
    if (!content.trim()) return toast.error("Nội dung không được trống");
    if (countWordTokens(content) === 0)
      return toast.error("Cần ít nhất 1 từ chêm dạng [[word|nghĩa]]");

    try {
      if (isEdit && story) {
        await updateMut.mutateAsync({ title: title.trim(), content, contentEn, imageUrl });
        toast.success("Đã lưu truyện");
        onDone?.(story.id);
      } else {
        const created = await createMut.mutateAsync({
          deckId,
          title: title.trim(),
          content,
          contentEn,
          imageUrl,
        });
        toast.success("Đã tạo truyện");
        onDone?.(created.id);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi không xác định");
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Quay lại
        </button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isEdit ? "Lưu" : "Tạo truyện"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Buổi sáng yên bình"
              className="bg-card shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Ảnh minh hoạ</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={imageLoading}
                onClick={() => imageInputRef.current?.click()}
              >
                {imageLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                {imageUrl ? "Đổi ảnh" : "Tải ảnh lên"}
              </Button>
              {imageUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setImageUrl("")}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Xoá ảnh
                </Button>
              ) : null}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePickImage}
              />
            </div>
            {!imageUrl.startsWith("data:") ? (
              <Input
                id="image"
                value={imageUrl ?? ""}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="hoặc dán URL ảnh: https://..."
                className="bg-card shadow-sm"
              />
            ) : null}
            <p className="text-xs text-muted-foreground">
              Ảnh tải lên được giữ nguyên khung gốc, chỉ nén &amp; lưu cùng truyện (tối đa 5MB).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">
              Nội dung (markup{" "}
              <code className="rounded bg-muted px-1 text-xs">[[word|nghĩa]]</code>)
            </Label>
            <Textarea
              id="content"
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={14}
              className="bg-card font-mono text-sm shadow-sm"
              placeholder={
                "Sáng nay tôi [[wake up|thức dậy]] lúc 6h, cảm thấy [[exhausted|kiệt sức]]..."
              }
            />
            <p className="text-xs text-muted-foreground">
              {countWordTokens(content)} từ chêm · {content.length} ký tự
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentEn">Bản full tiếng Anh (tùy chọn)</Label>
            <Textarea
              id="contentEn"
              value={contentEn}
              onChange={(e) => setContentEn(e.target.value)}
              rows={8}
              className="bg-card text-sm shadow-sm"
              placeholder="Bản dịch toàn bộ sang tiếng Anh — để trống nếu chưa có. Dùng cho chế độ đọc 'English'."
            />
            <p className="text-xs text-muted-foreground">
              Để trống thì nút &ldquo;English&rdquo; khi đọc sẽ bị khóa. Bản tiếng Việt được tạo tự động từ nội dung chêm.
            </p>
          </div>

          {cards && cards.length > 0 ? (
            <div className="space-y-2">
              <Label>Chêm từ (click để chèn)</Label>
              <div className="flex max-h-48 flex-wrap gap-1 overflow-y-auto rounded-lg border bg-card p-3">
                {cards.map((c) => {
                  const used = usedWords.has(c.word.toLowerCase());
                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={used}
                      onClick={() => insertWord(c.word, c.meaning)}
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors ${
                        used
                          ? "border-green-500/40 bg-green-500/10 text-green-400 opacity-60"
                          : "border-border hover:border-primary hover:bg-primary/5"
                      }`}
                    >
                      {used ? null : <Plus className="h-3 w-3" />}
                      {c.word}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <Label>Preview</Label>
          <div className="rounded-xl border bg-card p-6">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={title}
                className="mb-4 max-h-80 w-full rounded-lg object-contain"
              />
            ) : null}
            {title ? <h2 className="mb-3 text-2xl font-bold">{title}</h2> : null}
            <div className="mb-3">
              <Badge variant="secondary">{countWordTokens(content)} từ chêm</Badge>
            </div>
            {content ? (
              <StoryRenderer content={content} />
            ) : (
              <p className="text-muted-foreground">Preview sẽ hiện ở đây...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
