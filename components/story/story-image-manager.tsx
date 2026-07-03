"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, FolderUp, ImageOff, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiPatch } from "@/lib/api-client";
import { fileToStoryImageDataUrl } from "@/lib/image";
import type { StoryListItem } from "@/lib/types";

interface StoryImageManagerProps {
  /** Danh sách truyện đang hiển thị (đã lọc theo deck). */
  stories: readonly StoryListItem[];
  onClose: () => void;
}

/** Ảnh mới đang chờ lưu cho một truyện. */
interface PendingImage {
  dataUrl: string;
  fileName: string;
}

/** Lấy số Unit từ chuỗi ("Unit 15 ..." / "unit-15.png" → 15). */
function unitNumber(s: string): number | null {
  const match = s.match(/unit\s*[-_ ]?(\d+)/i);
  return match ? Number(match[1]) : null;
}

/**
 * Dialog cập nhật ảnh cho NHIỀU truyện cùng lúc:
 * - "Chọn nhiều ảnh": tự khớp file → truyện theo số Unit trong tên file
 *   (không khớp được thì điền lần lượt theo thứ tự danh sách).
 * - Mỗi dòng vẫn chọn lại ảnh riêng được. Ảnh lưu NGUYÊN GỐC, không crop.
 */
export function StoryImageManager({ stories, onClose }: StoryImageManagerProps) {
  const qc = useQueryClient();
  const [pending, setPending] = useState<ReadonlyMap<string, PendingImage>>(new Map());
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  // Esc để đóng (trừ lúc đang lưu) + khóa cuộn nền.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, saving]);

  const setPendingFor = (storyId: string, img: PendingImage | null) => {
    setPending((prevMap) => {
      const next = new Map(prevMap);
      if (img) next.set(storyId, img);
      else next.delete(storyId);
      return next;
    });
  };

  // Gán 1 file cho 1 truyện cụ thể.
  const assignSingle = async (storyId: string, file: File) => {
    setProcessing(true);
    try {
      const dataUrl = await fileToStoryImageDataUrl(file);
      setPendingFor(storyId, { dataUrl, fileName: file.name });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Lỗi đọc ảnh ${file.name}`);
    } finally {
      setProcessing(false);
    }
  };

  // Gán nhiều file: ưu tiên khớp số Unit trong tên file với tên deck,
  // còn lại điền lần lượt vào các truyện chưa có ảnh chờ.
  const assignBulk = async (files: FileList) => {
    const list = [...files].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true }),
    );
    setProcessing(true);
    try {
      const taken = new Set(pending.keys());
      const additions = new Map<string, PendingImage>();
      let skipped = 0;

      for (const file of list) {
        const unit = unitNumber(file.name);
        const target =
          (unit != null
            ? stories.find((s) => unitNumber(s.deck.name) === unit && !taken.has(s.id))
            : undefined) ?? stories.find((s) => !taken.has(s.id));
        if (!target) {
          skipped += 1;
          continue;
        }
        taken.add(target.id);
        try {
          const dataUrl = await fileToStoryImageDataUrl(file);
          additions.set(target.id, { dataUrl, fileName: file.name });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : `Lỗi đọc ảnh ${file.name}`);
        }
      }

      if (additions.size > 0) {
        setPending((prevMap) => new Map([...prevMap, ...additions]));
      }
      if (skipped > 0) toast.warning(`${skipped} ảnh bị bỏ qua vì không còn truyện trống`);
    } finally {
      setProcessing(false);
    }
  };

  // Lưu tất cả ảnh chờ, tuần tự từng truyện; xong mới invalidate cache 1 lần.
  const saveAll = async () => {
    if (pending.size === 0) return;
    setSaving(true);
    let saved = 0;
    const failed: string[] = [];
    for (const [storyId, img] of pending) {
      try {
        await apiPatch(`/api/stories/${storyId}`, { imageUrl: img.dataUrl });
        saved += 1;
        setPendingFor(storyId, null);
      } catch {
        failed.push(stories.find((s) => s.id === storyId)?.title ?? storyId);
      }
    }
    qc.invalidateQueries({ queryKey: ["stories"] });
    setSaving(false);
    if (saved > 0) toast.success(`Đã cập nhật ${saved} ảnh 🎉`);
    if (failed.length > 0) toast.error(`Lỗi lưu ảnh: ${failed.join(", ")}`);
    if (failed.length === 0) onClose();
  };

  const busy = processing || saving;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Quản lý ảnh truyện"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={saving ? undefined : onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Quản lý ảnh truyện</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Ảnh lưu nguyên gốc (không cắt). Đặt tên file kiểu &ldquo;unit-15.png&rdquo; để tự
              khớp với deck Unit 15.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Chọn nhiều ảnh */}
        <div className="border-b px-5 py-3">
          <input
            ref={bulkInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) void assignBulk(e.target.files);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={busy}
            onClick={() => bulkInputRef.current?.click()}
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FolderUp className="h-4 w-4" />
            )}
            Chọn nhiều ảnh cùng lúc
          </Button>
        </div>

        {/* Danh sách truyện */}
        <ul className="min-h-0 flex-1 divide-y overflow-y-auto">
          {stories.map((story) => {
            const p = pending.get(story.id);
            return (
              <StoryImageRow
                key={story.id}
                story={story}
                pending={p}
                disabled={busy}
                onPick={(file) => void assignSingle(story.id, file)}
                onClear={() => setPendingFor(story.id, null)}
              />
            );
          })}
        </ul>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t px-5 py-3">
          <span className="text-xs text-muted-foreground">
            {pending.size > 0 ? `${pending.size} ảnh chờ lưu` : "Chưa chọn ảnh mới"}
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Đóng
            </Button>
            <Button type="button" onClick={() => void saveAll()} disabled={busy || pending.size === 0}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Lưu {pending.size > 0 ? `${pending.size} ảnh` : "ảnh"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StoryImageRowProps {
  story: StoryListItem;
  pending?: PendingImage;
  disabled: boolean;
  onPick: (file: File) => void;
  onClear: () => void;
}

function StoryImageRow({ story, pending, disabled, onPick, onClear }: StoryImageRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <li className="flex items-center gap-3 px-5 py-3">
      {/* Ảnh hiện tại */}
      {story.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={story.imageUrl}
          alt=""
          className="h-12 w-20 shrink-0 rounded-md border object-cover"
        />
      ) : (
        <span className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md border border-dashed text-muted-foreground">
          <ImageOff className="h-4 w-4" />
        </span>
      )}

      {/* Ảnh mới (nếu có) */}
      {pending ? (
        <>
          <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pending.dataUrl}
            alt={pending.fileName}
            title={pending.fileName}
            className="h-12 w-20 shrink-0 rounded-md border-2 border-primary object-cover"
          />
        </>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{story.title}</div>
        <div className="truncate text-xs text-muted-foreground">
          {story.deck.name}
          {pending ? ` · ${pending.fileName}` : ""}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = "";
        }}
      />
      {pending ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full"
          disabled={disabled}
          onClick={onClear}
          aria-label="Bỏ ảnh mới"
          title="Bỏ ảnh mới"
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 rounded-full"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        Chọn ảnh
      </Button>
    </li>
  );
}
