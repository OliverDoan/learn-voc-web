"use client";

import { Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { splitDeckName } from "@/lib/inbox";
import { EXAM_COUNT_PRESETS, EXAM_MAX_COUNT } from "@/lib/exam";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import type { DeckWithCounts } from "@/lib/types";

interface ExamSetupMailViewProps {
  decks: readonly DeckWithCounts[];
  isLoading: boolean;
  selected: ReadonlySet<string>;
  onToggleDeck: (id: string) => void;
  /** "none" | "some" | "all" — trạng thái ô chọn tất cả (chỉ tính Unit đang mở). */
  selection: "none" | "some" | "all";
  onToggleAll: () => void;
  count: number | null;
  onCountChange: (count: number | null) => void;
  onCountInput: (raw: string) => void;
  totalSelectedCards: number;
  effectiveCount: number;
  onStart: () => void;
  startDisabled: boolean;
}

const CHIP = "flex h-8 items-center rounded-lg border px-3 text-sm transition-colors";
const CHIP_ON = "border-transparent bg-mail-active font-medium";
const CHIP_OFF = "border-input hover:bg-mail-hover";

/** Bước chọn Unit của trang Kiểm tra, dạng hộp thư Gmail: mỗi Unit là một dòng tick chọn. */
export function ExamSetupMailView(props: ExamSetupMailViewProps) {
  const { decks, selected, count, effectiveCount } = props;

  return (
    <section aria-label="Kiểm tra">
      <div className="sticky top-[var(--shell-top)] z-20 flex h-12 items-center gap-2 rounded-t-2xl bg-card px-2 md:px-4">
        <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full hover:bg-foreground/[.08]">
          <input
            type="checkbox"
            className="h-[18px] w-[18px] cursor-pointer accent-primary"
            checked={props.selection === "all"}
            ref={(el) => {
              if (el) el.indeterminate = props.selection === "some";
            }}
            onChange={props.onToggleAll}
            aria-label="Chọn tất cả Unit đang mở"
          />
        </label>
        <h1 className="text-lg">Kiểm tra</h1>
        <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
          {selected.size === 0
            ? "Chưa chọn Unit nào"
            : `${selected.size} Unit · ${props.totalSelectedCards} từ → kiểm tra ${effectiveCount} từ ngẫu nhiên`}
        </span>
        <button
          type="button"
          onClick={props.onStart}
          disabled={props.startDisabled}
          className="ml-auto flex h-9 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:shadow-md disabled:opacity-40 sm:ml-2"
        >
          <Play className="h-4 w-4" /> Bắt đầu
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b px-4 pb-3 pt-1 md:pl-[68px]">
        <span className="mr-1 text-sm text-muted-foreground">Số từ:</span>
        {EXAM_COUNT_PRESETS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => props.onCountChange(n)}
            className={cn(CHIP, count === n ? CHIP_ON : CHIP_OFF)}
            aria-pressed={count === n}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => props.onCountChange(null)}
          className={cn(CHIP, count === null ? CHIP_ON : CHIP_OFF)}
          aria-pressed={count === null}
        >
          Tất cả
        </button>
        <label className={cn(CHIP, CHIP_OFF, "gap-1.5")}>
          <input
            type="number"
            min={1}
            max={EXAM_MAX_COUNT}
            value={count ?? ""}
            placeholder="Tuỳ chọn"
            onChange={(e) => props.onCountInput(e.target.value)}
            className="w-16 bg-transparent outline-none placeholder:text-muted-foreground"
            aria-label="Số lượng từ tuỳ chọn"
          />
          từ
        </label>
      </div>

      {props.isLoading ? (
        <div className="p-4">
          <ListSkeleton />
        </div>
      ) : (
        <ul>
          {decks.map((d) => {
            const checked = selected.has(d.id);
            const { sender, subject } = splitDeckName(d.name);
            return (
              <li key={d.id}>
                <label
                  title={d.locked ? "Unit đang khoá — hoàn thành các Unit trước để mở" : undefined}
                  className={cn(
                    "relative flex h-10 items-center gap-2 border-b pr-4 text-sm",
                    d.locked
                      ? "cursor-not-allowed bg-mail-read text-muted-foreground"
                      : "cursor-pointer hover:z-10 hover:shadow-[inset_1px_0_0_#dadce0,inset_-1px_0_0_#dadce0,0_1px_2px_0_rgba(60,64,67,.3),0_1px_3px_1px_rgba(60,64,67,.15)]",
                    checked ? "bg-mail-active" : !d.locked && "bg-card",
                  )}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center pl-2 md:w-12">
                    {d.locked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => props.onToggleDeck(d.id)}
                        className="h-[18px] w-[18px] cursor-pointer accent-primary"
                        aria-label={`Chọn ${d.name}`}
                      />
                    )}
                  </span>
                  <span className="w-20 shrink-0 truncate pl-2 font-bold sm:w-[120px]">{sender}</span>
                  <span className="min-w-0 flex-1 truncate">
                    {subject ? <span className={d.locked ? "" : "font-bold"}>{subject}</span> : null}
                    {d.description ? (
                      <span className="text-muted-foreground">
                        {subject ? " - " : ""}
                        {d.description}
                      </span>
                    ) : null}
                  </span>
                  <span className={cn("shrink-0 text-xs", !d.locked && "font-bold")}>{d._count.cards} từ</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      <p className="py-6 text-center text-xs text-muted-foreground">
        Từ được lấy ngẫu nhiên từ các Unit đã chọn · xem nghĩa tiếng Việt, gõ từ tiếng Anh + từ loại
      </p>
    </section>
  );
}
