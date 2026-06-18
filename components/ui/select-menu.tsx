"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  /** Emoji/icon tuỳ chọn hiển thị trước nhãn. */
  icon?: string | null;
  /** Số đếm hiển thị mờ ở cuối dòng. */
  count?: number;
}

interface SelectMenuProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  className?: string;
  /** id để liên kết với <label htmlFor>. */
  id?: string;
}

/**
 * Dropdown select tuỳ biến, đồng bộ với dark theme (thay cho native <select> xấu).
 * Hỗ trợ click-outside + phím Escape để đóng.
 */
export function SelectMenu({
  value,
  onChange,
  options,
  placeholder = "Chọn...",
  className = "",
  id,
}: SelectMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Đóng khi click ra ngoài hoặc nhấn Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSelect = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="truncate">
          {selected ? (
            <>
              {selected.icon ? `${selected.icon} ` : ""}
              {selected.label}
              {selected.count !== undefined ? (
                <span className="text-muted-foreground"> ({selected.count})</span>
              ) : null}
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute z-50 mt-1.5 max-h-72 w-full min-w-[14rem] overflow-auto rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-[0_16px_48px_rgba(0,0,0,.4)]"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/60"
                  }`}
                >
                  <Check
                    className={`h-4 w-4 shrink-0 ${
                      active ? "text-primary" : "opacity-0"
                    }`}
                  />
                  <span className="flex-1 truncate">
                    {opt.icon ? `${opt.icon} ` : ""}
                    {opt.label}
                  </span>
                  {opt.count !== undefined ? (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {opt.count}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
