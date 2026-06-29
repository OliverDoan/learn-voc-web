"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface TooltipProps {
  /** Nội dung tooltip hiển thị khi hover/focus. */
  label: string;
  /** Phần tử kích hoạt (thường là nút icon). */
  children: ReactNode;
  /** Vị trí tooltip so với trigger. Mặc định "bottom". */
  side?: "top" | "bottom";
  /** Class bổ sung cho wrapper. */
  className?: string;
}

/**
 * Tooltip nhẹ chỉ dùng CSS (group-hover / focus-within), không phụ thuộc thư viện.
 * Hiện khi hover bằng chuột hoặc focus bằng bàn phím để giữ khả năng truy cập.
 */
export function Tooltip({ label, children, side = "bottom", className }: TooltipProps) {
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-md transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
          side === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
        )}
      >
        {label}
      </span>
    </span>
  );
}
