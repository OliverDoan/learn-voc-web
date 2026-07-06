"use client";

import { cn } from "@/lib/utils";

/** Chế độ hiển thị truyện: chêm (mặc định) / full tiếng Việt / full tiếng Anh. */
export type StoryViewMode = "cham" | "vi" | "en";

const OPTIONS: { key: StoryViewMode; label: string }[] = [
  { key: "cham", label: "Chêm" },
  { key: "vi", label: "Tiếng Việt" },
  { key: "en", label: "English" },
];

interface StoryModeToggleProps {
  value: StoryViewMode;
  onChange: (mode: StoryViewMode) => void;
  /** Có sẵn bản tiếng Anh hay không — nếu không, khóa nút English. */
  enAvailable?: boolean;
  className?: string;
}

export function StoryModeToggle({
  value,
  onChange,
  enAvailable = true,
  className,
}: StoryModeToggleProps) {
  return (
    <div className={cn("inline-flex rounded-full border bg-card p-0.5", className)}>
      {OPTIONS.map((o) => {
        const disabled = o.key === "en" && !enAvailable;
        const active = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            disabled={disabled}
            onClick={() => onChange(o.key)}
            title={disabled ? "Chưa có bản tiếng Anh" : undefined}
            aria-pressed={active}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
              disabled && "cursor-not-allowed opacity-40",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
