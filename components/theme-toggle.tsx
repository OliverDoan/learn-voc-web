"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";
import type { Theme } from "@/lib/theme";

const OPTIONS: Array<{ value: Theme; label: string; Icon: typeof Sun }> = [
  { value: "light", label: "Sáng", Icon: Sun },
  { value: "dark", label: "Tối", Icon: Moon },
  { value: "system", label: "Theo máy", Icon: Monitor },
];

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export function ThemeToggle({ className, compact = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Chế độ giao diện"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border bg-card p-1",
        className,
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            onClick={() => setTheme(value)}
            title={label}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {!compact ? <span>{label}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
