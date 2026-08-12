"use client";

import { useState } from "react";
import { ChevronDown, Lock, PanelLeft, RotateCcw } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav-items";
import { resetHiddenNavItems, setNavItemHidden } from "@/lib/sidebar-prefs";
import { useHiddenNavItems } from "@/hooks/use-sidebar-prefs";
import { cn } from "@/lib/utils";

/**
 * Cấu hình mục hiển thị trên thanh bên (sidebar) qua dropdown có toggle bật/tắt.
 * Lưu trực tiếp vào localStorage qua store dùng chung nên sidebar cập nhật ngay.
 */
export function SidebarSection() {
  const hidden = useHiddenNavItems();
  const [open, setOpen] = useState(false);

  const shownCount = NAV_ITEMS.filter((i) => i.pinned || !hidden.has(i.href)).length;
  const hiddenCount = NAV_ITEMS.filter((i) => !i.pinned && hidden.has(i.href)).length;

  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="mb-1 flex items-center gap-2">
        <PanelLeft className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Thanh bên</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Chọn mục hiển thị trên thanh điều hướng bên trái. Mục &quot;Cài đặt&quot; luôn hiển thị.
      </p>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm transition-colors hover:bg-accent"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="text-muted-foreground">
            Đang hiện <strong className="text-foreground">{shownCount}</strong>/{NAV_ITEMS.length}{" "}
            mục
          </span>
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </button>

        {open ? (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <div
              role="group"
              aria-label="Bật/tắt mục thanh bên"
              className="absolute left-0 right-0 top-full z-30 mt-1 max-h-80 overflow-y-auto rounded-lg border bg-popover text-popover-foreground p-1.5 shadow-lg"
            >
              {NAV_ITEMS.map((item) => {
                const shown = item.pinned || !hidden.has(item.href);
                return (
                  <button
                    key={item.href}
                    type="button"
                    role="switch"
                    aria-checked={shown}
                    aria-label={`${shown ? "Ẩn" : "Hiện"} ${item.label}`}
                    disabled={item.pinned}
                    onClick={() => setNavItemHidden(item.href, shown)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors",
                      item.pinned ? "cursor-not-allowed opacity-60" : "hover:bg-accent",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.pinned ? (
                      <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <span
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
                          shown ? "bg-primary" : "bg-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                            shown ? "translate-x-[18px]" : "translate-x-0.5",
                          )}
                        />
                      </span>
                    )}
                  </button>
                );
              })}

              {hiddenCount > 0 ? (
                <>
                  <div className="my-1 h-px bg-border" />
                  <button
                    type="button"
                    onClick={resetHiddenNavItems}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <RotateCcw className="h-4 w-4" /> Hiện tất cả
                  </button>
                </>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
