"use client";

import { LayoutPanelLeft, Mail, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { setUiTheme, useUiTheme } from "@/hooks/use-ui-theme";
import { UI_THEME_LABELS, UI_THEMES, type UiTheme } from "@/lib/ui-theme";

const ICONS: Record<UiTheme, LucideIcon> = {
  gmail: Mail,
  classic: LayoutPanelLeft,
};

/** Chọn kiểu giao diện: Gmail hoặc Cổ điển (giao diện cũ). */
export function UiThemePicker() {
  const current = useUiTheme();

  return (
    <div role="radiogroup" aria-label="Kiểu giao diện" className="grid gap-2 sm:grid-cols-2">
      {UI_THEMES.map((value) => {
        const Icon = ICONS[value];
        const active = current === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setUiTheme(value)}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-3 text-left transition-colors",
              active ? "border-primary bg-primary/10" : "hover:bg-accent",
            )}
          >
            <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
            <span>
              <span className="block text-sm font-semibold">{UI_THEME_LABELS[value].label}</span>
              <span className="block text-xs text-muted-foreground">{UI_THEME_LABELS[value].desc}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
