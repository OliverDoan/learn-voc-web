"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { SelectOption } from "@/components/ui/select-menu";

interface MultiSelectMenuProps {
  /** Danh sách value đang được chọn. Rỗng = chưa chọn gì. */
  values: string[];
  onChange: (values: string[]) => void;
  options: readonly SelectOption[];
  /** Nhãn hiển thị khi chưa chọn gì (cũng là nghĩa "tất cả"). */
  placeholder?: string;
  /** Mẫu nhãn khi chọn nhiều, %d sẽ thay bằng số lượng. */
  summaryLabel?: (count: number) => string;
  className?: string;
  id?: string;
}

/**
 * Dropdown chọn NHIỀU giá trị, có checkbox bên trong mỗi dòng.
 * Đồng bộ dark theme với SelectMenu; hỗ trợ click-outside + Escape để đóng.
 */
export function MultiSelectMenu({
  values,
  onChange,
  options,
  placeholder = "Tất cả",
  summaryLabel = (n) => `Đã chọn ${n}`,
  className = "",
  id,
}: MultiSelectMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  const toggle = (value: string) => {
    onChange(
      values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value],
    );
  };

  const selectedOptions = options.filter((o) => values.includes(o.value));

  const triggerText =
    selectedOptions.length === 0
      ? placeholder
      : selectedOptions.length === 1
        ? `${selectedOptions[0].icon ? `${selectedOptions[0].icon} ` : ""}${selectedOptions[0].label}`
        : summaryLabel(selectedOptions.length);

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
          {selectedOptions.length === 0 ? (
            <span className="text-muted-foreground">{triggerText}</span>
          ) : (
            triggerText
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div className="absolute z-50 mt-1.5 max-h-72 w-full min-w-[14rem] overflow-auto rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-[0_16px_48px_rgba(0,0,0,.4)]">
          {values.length > 0 ? (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mb-1 flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent/60"
            >
              Bỏ chọn tất cả
              <span>({values.length})</span>
            </button>
          ) : null}
          <ul role="listbox" aria-multiselectable="true">
            {options.map((opt) => {
              const checked = values.includes(opt.value);
              return (
                <li key={opt.value} role="option" aria-selected={checked}>
                  <button
                    type="button"
                    onClick={() => toggle(opt.value)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      checked ? "bg-accent/40" : "hover:bg-accent/60"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        checked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {checked ? <Check className="h-3 w-3" /> : null}
                    </span>
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
        </div>
      ) : null}
    </div>
  );
}
