"use client";

import { useEffect, useRef, useState } from "react";
import type HanziWriter from "hanzi-writer";
import type { CharWritingResult } from "@/lib/chinese-writing";

interface HanziWritingPadProps {
  char: string;
  /** Hiện nét mờ của chữ để tô theo. */
  showOutline: boolean;
  onComplete: (result: CharWritingResult) => void;
  /** Không tải được dữ liệu nét (mất mạng / chữ không có dữ liệu). */
  onLoadError: () => void;
  size?: number;
}

/** Sai 3 lần cùng một nét thì nháy gợi ý nét đúng. */
const HINT_AFTER_MISSES = 3;

/**
 * Khung viết một chữ Hán từng nét (hanzi-writer quiz): vẽ đúng thứ tự & hướng nét thì
 * nhận, sai thì đếm lỗi. Dữ liệu nét tải từ CDN jsDelivr khi cần.
 */
export function HanziWritingPad({
  char,
  showOutline,
  onComplete,
  onLoadError,
  size = 280,
}: HanziWritingPadProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  // Giữ callback mới nhất mà không phải tạo lại writer (tạo lại = mất nét đang vẽ).
  const onCompleteRef = useRef(onComplete);
  const onLoadErrorRef = useRef(onLoadError);
  const showOutlineRef = useRef(showOutline);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onLoadErrorRef.current = onLoadError;
  }, [onComplete, onLoadError]);

  useEffect(() => {
    let cancelled = false;
    const target = targetRef.current;
    if (!target) return;

    // Số nét của chữ — chỉ biết sau khi vẽ đúng nét cuối (strokesRemaining = 0).
    let strokes = 0;

    void import("hanzi-writer").then(({ default: HanziWriterLib }) => {
      if (cancelled) return;
      target.innerHTML = "";
      const writer = HanziWriterLib.create(target, char, {
        width: size,
        height: size,
        padding: 12,
        showCharacter: false,
        showOutline: showOutlineRef.current,
        outlineColor: "#94a3b8",
        drawingColor: "#2563eb",
        strokeColor: "#1e293b",
        highlightColor: "#22c55e",
        drawingWidth: 18,
        onLoadCharDataSuccess: () => {
          if (!cancelled) setLoading(false);
        },
        onLoadCharDataError: () => {
          if (cancelled) return;
          setLoading(false);
          onLoadErrorRef.current();
        },
      });
      writerRef.current = writer;
      void writer.quiz({
        showHintAfterMisses: HINT_AFTER_MISSES,
        onCorrectStroke: (data) => {
          strokes = data.strokeNum + 1 + data.strokesRemaining;
        },
        onComplete: ({ totalMistakes }) => {
          if (!cancelled) onCompleteRef.current({ strokes, mistakes: totalMistakes });
        },
      });
    });

    return () => {
      cancelled = true;
      writerRef.current?.cancelQuiz();
      writerRef.current = null;
      target.innerHTML = "";
    };
  }, [char, size]);

  // Bật/tắt nét mờ ngay trên writer đang viết, không reset bài.
  useEffect(() => {
    showOutlineRef.current = showOutline;
    const writer = writerRef.current;
    if (!writer) return;
    if (showOutline) void writer.showOutline();
    else void writer.hideOutline();
  }, [showOutline]);

  return (
    <div
      className="relative touch-none select-none rounded-2xl border-2 bg-white"
      style={{ width: size, height: size }}
    >
      {/* Lưới 米字格 làm nền để căn chữ */}
      <svg
        className="pointer-events-none absolute inset-0"
        width={size}
        height={size}
        aria-hidden="true"
      >
        <g stroke="#e2e8f0" strokeWidth={1} strokeDasharray="6 6">
          <line x1={0} y1={0} x2={size} y2={size} />
          <line x1={size} y1={0} x2={0} y2={size} />
          <line x1={size / 2} y1={0} x2={size / 2} y2={size} />
          <line x1={0} y1={size / 2} x2={size} y2={size / 2} />
        </g>
      </svg>
      <div ref={targetRef} className="absolute inset-0" aria-label={`Khung viết chữ ${char}`} />
      {loading ? (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
          Đang tải nét chữ…
        </p>
      ) : null}
    </div>
  );
}
