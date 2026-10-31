"use client";

import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Clock,
  MailOpen,
  RotateCw,
  Trash2,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "./icon-button";

interface MailToolbarProps {
  /** "none" | "some" | "all" — trạng thái checkbox chọn tất cả. */
  selection: "none" | "some" | "all";
  onToggleAll: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  inTrash: boolean;
  busy: boolean;
  onArchive: () => void;
  onDelete: () => void;
  onMarkRead: () => void;
  onSnooze: () => void;
  onRestore: () => void;
  from: number;
  to: number;
  total: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/** Thanh công cụ trên danh sách: chọn tất cả, làm mới, thao tác hàng loạt, phân trang. */
export function MailToolbar(props: MailToolbarProps) {
  const hasSelection = props.selection !== "none";

  return (
    <div className="sticky top-[var(--shell-top)] z-20 flex h-12 items-center gap-1 rounded-t-2xl bg-card px-2 md:px-4">
      <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full hover:bg-foreground/[.08]">
        <input
          type="checkbox"
          className="h-[18px] w-[18px] cursor-pointer accent-primary"
          checked={props.selection === "all"}
          ref={(el) => {
            if (el) el.indeterminate = props.selection === "some";
          }}
          onChange={props.onToggleAll}
          aria-label="Chọn tất cả trên trang"
        />
      </label>

      {hasSelection ? (
        props.inTrash ? (
          <>
            <IconButton label="Khôi phục" onClick={props.onRestore} disabled={props.busy}>
              <Undo2 className="h-5 w-5" />
            </IconButton>
            <IconButton label="Xoá vĩnh viễn" onClick={props.onDelete} disabled={props.busy}>
              <Trash2 className="h-5 w-5" />
            </IconButton>
          </>
        ) : (
          <>
            <IconButton label="Lưu trữ (đã thuộc)" onClick={props.onArchive} disabled={props.busy}>
              <Archive className="h-5 w-5" />
            </IconButton>
            <IconButton label="Xoá" onClick={props.onDelete} disabled={props.busy}>
              <Trash2 className="h-5 w-5" />
            </IconButton>
            <div className="mx-1 h-5 w-px bg-border" />
            <IconButton label="Đánh dấu đã ôn" onClick={props.onMarkRead} disabled={props.busy}>
              <MailOpen className="h-5 w-5" />
            </IconButton>
            <IconButton label="Tạm ẩn tới ngày mai" onClick={props.onSnooze} disabled={props.busy}>
              <Clock className="h-5 w-5" />
            </IconButton>
          </>
        )
      ) : (
        <IconButton label="Làm mới" onClick={props.onRefresh}>
          <RotateCw className={cn("h-5 w-5", props.refreshing && "animate-spin")} />
        </IconButton>
      )}

      <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
        <span className="hidden sm:inline">
          {props.from.toLocaleString("vi-VN")}–{props.to.toLocaleString("vi-VN")} trên{" "}
          {props.total.toLocaleString("vi-VN")}
        </span>
        <IconButton label="Mới hơn" onClick={props.onPrev} disabled={!props.canPrev}>
          <ChevronLeft className="h-5 w-5" />
        </IconButton>
        <IconButton label="Cũ hơn" onClick={props.onNext} disabled={!props.canNext}>
          <ChevronRight className="h-5 w-5" />
        </IconButton>
      </div>
    </div>
  );
}
