"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cropImageToDataUrl, STORY_IMAGE_ASPECT } from "@/lib/image";

interface StoryImageCropperProps {
  open: boolean;
  /** Data URL / URL của ảnh gốc cần crop */
  src: string;
  /** Tỉ lệ khung crop (rộng / cao), mặc định 16:9 */
  aspect?: number;
  onCancel: () => void;
  onCropped: (dataUrl: string) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

interface Offset {
  x: number;
  y: number;
}

/**
 * Dialog crop ảnh minh hoạ truyện: kéo để di chuyển, thanh trượt để zoom.
 * Ảnh luôn phủ kín khung (cover) để không lộ viền trống.
 */
export function StoryImageCropper({
  open,
  src,
  aspect = STORY_IMAGE_ASPECT,
  onCancel,
  onCropped,
}: StoryImageCropperProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [area, setArea] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);
  const dragRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  // Tải kích thước gốc của ảnh khi mở dialog / đổi ảnh.
  useEffect(() => {
    if (!open || !src) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => {
      if (!cancelled) toast.error("Không tải được ảnh để cắt");
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [open, src]);

  // Theo dõi kích thước khung crop (đổi theo bề rộng dialog).
  useEffect(() => {
    if (!open) return;
    const el = areaRef.current;
    if (!el) return;
    const update = () =>
      setArea({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, aspect]);

  // Tỉ lệ để ảnh phủ kín khung ở zoom = 1.
  const baseScale =
    natural && area.w > 0
      ? Math.max(area.w / natural.w, area.h / natural.h)
      : 1;
  const displayScale = baseScale * zoom;
  const displayW = natural ? natural.w * displayScale : 0;
  const displayH = natural ? natural.h * displayScale : 0;

  // Giới hạn offset để ảnh luôn phủ kín khung (tính theo zoom truyền vào).
  const clampAt = useCallback(
    (o: Offset, z: number): Offset => {
      if (!natural) return o;
      const dw = natural.w * baseScale * z;
      const dh = natural.h * baseScale * z;
      const maxX = Math.max(0, (dw - area.w) / 2);
      const maxY = Math.max(0, (dh - area.h) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, o.x)),
        y: Math.min(maxY, Math.max(-maxY, o.y)),
      };
    },
    [natural, baseScale, area.w, area.h],
  );

  // Đổi zoom → clamp lại offset ngay để không lộ viền trống.
  const changeZoom = (z: number) => {
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
    setZoom(next);
    setOffset((o) => clampAt(o, next));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    setOffset(
      clampAt({ x: d.ox + (e.clientX - d.px), y: d.oy + (e.clientY - d.py) }, zoom),
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent) => {
    changeZoom(zoom - e.deltaY * 0.002);
  };

  const handleConfirm = async () => {
    if (!natural || area.w === 0) return;
    setProcessing(true);
    try {
      // Toạ độ góc trên-trái của khung crop trên ảnh hiển thị → quy về pixel gốc.
      const crop = {
        x: (displayW / 2 - area.w / 2 - offset.x) / displayScale,
        y: (displayH / 2 - area.h / 2 - offset.y) / displayScale,
        width: area.w / displayScale,
        height: area.h / displayScale,
      };
      const dataUrl = await cropImageToDataUrl(src, crop);
      onCropped(dataUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi cắt ảnh");
    } finally {
      setProcessing(false);
    }
  };

  // Giữ nguyên toàn bộ ảnh gốc (không cắt) — chỉ resize về bề rộng tối đa cho nhẹ DB.
  const handleKeepFull = async () => {
    if (!natural) return;
    setProcessing(true);
    try {
      const dataUrl = await cropImageToDataUrl(src, {
        x: 0,
        y: 0,
        width: natural.w,
        height: natural.h,
      });
      onCropped(dataUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi xử lý ảnh");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onCancel() : undefined)}>
      <DialogContent onClose={onCancel}>
        <DialogHeader>
          <DialogTitle>Cắt ảnh minh hoạ</DialogTitle>
        </DialogHeader>

        <div
          ref={areaRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          className="relative w-full cursor-move touch-none select-none overflow-hidden rounded-lg border bg-muted"
          style={{ aspectRatio: String(aspect) }}
        >
          {natural ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt="Ảnh cần cắt"
              draggable={false}
              className="pointer-events-none absolute max-w-none"
              style={{
                width: displayW,
                height: displayH,
                left: area.w / 2 + offset.x - displayW / 2,
                top: area.h / 2 + offset.y - displayH / 2,
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <ZoomOut className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => changeZoom(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer accent-primary"
            aria-label="Phóng to / thu nhỏ"
          />
          <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Kéo để di chuyển ảnh, dùng thanh trượt hoặc lăn chuột để phóng to. Ảnh dọc/nhiều
          khung nên chọn &ldquo;Giữ nguyên ảnh&rdquo; để không mất phần trên/dưới.
        </p>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={processing}>
            Huỷ
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleKeepFull}
            disabled={processing || !natural}
            title="Không cắt — giữ nguyên toàn bộ chiều cao ảnh gốc"
          >
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Giữ nguyên ảnh
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={processing || !natural}>
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Áp dụng khung cắt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
