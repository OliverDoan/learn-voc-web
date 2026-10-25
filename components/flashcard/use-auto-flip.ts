"use client";

import { useEffect, useRef } from "react";

/** Thời gian chờ trước khi tự lật — đủ để kịp nghĩ ra đáp án. */
export const AUTO_FLIP_DELAY_MS = 2000;

interface UseAutoFlipOptions {
  enabled: boolean;
  /** Khoá định danh lượt xem thẻ (vd `${pos}-${id}`); null khi chưa có thẻ. */
  cardKey: string | null;
  flipped: boolean;
  onFlip: () => void;
  delayMs?: number;
}

/**
 * Tự lật thẻ sau `delayMs` khi thẻ mới hiện ra. Mỗi lượt xem chỉ tự lật 1 lần:
 * người dùng lật ngược lại để xem mặt trước thì không bị lật tiếp.
 */
export function useAutoFlip({
  enabled,
  cardKey,
  flipped,
  onFlip,
  delayMs = AUTO_FLIP_DELAY_MS,
}: UseAutoFlipOptions): void {
  const lastAutoFlippedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !cardKey || flipped || lastAutoFlippedRef.current === cardKey) return;
    const t = setTimeout(() => {
      lastAutoFlippedRef.current = cardKey;
      onFlip();
    }, delayMs);
    return () => clearTimeout(t);
  }, [enabled, cardKey, flipped, onFlip, delayMs]);
}
