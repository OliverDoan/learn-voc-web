"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Nhãn cho screen reader + tooltip. */
  label: string;
}

/** Nút icon tròn kiểu Gmail (hover nền xám tròn). */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, className, type = "button", children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[.08] hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
IconButton.displayName = "IconButton";
