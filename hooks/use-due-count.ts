"use client";

import { useMemo } from "react";
import { useDecks } from "./use-decks";

export interface DueSummary {
  /** Số thẻ đến hạn ôn (chỉ tính deck đã mở khoá). */
  due: number;
  /** Số thẻ mới chưa học (chỉ tính deck đã mở khoá). */
  newCount: number;
  total: number;
}

/** Tổng số thẻ cần học hôm nay trên toàn bộ deck đang mở khoá. */
export function useDueCount(): DueSummary {
  const { data: decks } = useDecks();

  return useMemo(() => {
    const open = (decks ?? []).filter((d) => !d.locked);
    const due = open.reduce((sum, d) => sum + (d.due ?? 0), 0);
    const newCount = open.reduce((sum, d) => sum + (d.newCount ?? 0), 0);
    return { due, newCount, total: due + newCount };
  }, [decks]);
}
