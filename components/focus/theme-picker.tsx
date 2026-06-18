"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { FOCUS_THEMES } from "@/lib/focus-themes";
import { useTheme } from "@/components/theme-provider";

interface ThemePickerProps {
  className?: string;
  /** Ẩn nhãn "Màu chủ đề" (khi đã có tiêu đề bên ngoài). */
  hideLabel?: boolean;
}

/** Hàng swatch chọn màu chủ đề — áp dụng cho toàn app. */
export function ThemePicker({ className, hideLabel = false }: ThemePickerProps) {
  const { palette, setPalette } = useTheme();

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {!hideLabel && <p className="text-sm font-semibold text-foreground">Màu chủ đề</p>}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {FOCUS_THEMES.map((theme) => {
          const active = theme.id === palette;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setPalette(theme.id)}
              aria-label={theme.name}
              aria-pressed={active}
              title={theme.name}
              style={{ background: theme.background }}
              className={cn(
                "grid h-11 w-11 place-items-center rounded-2xl border transition-transform hover:scale-105",
                active
                  ? "border-foreground/70 ring-2 ring-foreground/50"
                  : "border-border",
              )}
            >
              {active && (
                <Check className="h-4 w-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
