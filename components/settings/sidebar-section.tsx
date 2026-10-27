"use client";

import { toast } from "sonner";
import { Eye, Lock, RotateCcw } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav-items";
import {
  isDefaultHidden,
  resetNavItemsToDefault,
  setNavItemHidden,
  showAllNavItems,
} from "@/lib/sidebar-prefs";
import { useHiddenNavItems } from "@/hooks/use-sidebar-prefs";
import { cn } from "@/lib/utils";

// Tên các mục hiện sẵn ở bộ mặc định — lấy từ NAV_ITEMS để mô tả không bị lỗi thời.
const DEFAULT_LABELS = NAV_ITEMS.filter((i) => i.pinned || i.defaultVisible)
  .map((i) => i.label)
  .join(", ");

/**
 * Tab "Thanh bên" trong Cài đặt: danh sách phẳng các mục điều hướng, mỗi mục một
 * công tắc bật/tắt. Lưu trực tiếp vào localStorage qua store dùng chung nên sidebar
 * cập nhật ngay.
 */
export function SidebarSection() {
  const hidden = useHiddenNavItems();

  const shownCount = NAV_ITEMS.filter((i) => i.pinned || !hidden.has(i.href)).length;
  const hiddenCount = NAV_ITEMS.length - shownCount;
  const isDefault = isDefaultHidden(hidden);

  const handleReset = () => {
    resetNavItemsToDefault();
    toast.success("Đã khôi phục thanh bên về mặc định");
  };

  return (
    <section>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h3 className="font-semibold">Trên thanh điều hướng</h3>
        <span className="text-sm text-muted-foreground">
          {shownCount}/{NAV_ITEMS.length} mục
        </span>
        <div className="ml-auto flex items-center gap-1">
          {hiddenCount > 0 ? (
            <button
              type="button"
              onClick={showAllNavItems}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Eye className="h-3.5 w-3.5" /> Hiện tất cả
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleReset}
            disabled={isDefault}
            title={`Chỉ hiện ${DEFAULT_LABELS}`}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Khôi phục mặc định
          </button>
        </div>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Mục &quot;Cài đặt&quot; luôn hiển thị. Mặc định hiện: {DEFAULT_LABELS}.
      </p>

      <div role="group" aria-label="Bật/tắt mục thanh bên" className="flex flex-col">
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
                "flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm transition-colors",
                item.pinned ? "cursor-not-allowed" : "hover:bg-accent",
              )}
            >
              <span className="flex w-4 shrink-0 justify-center text-muted-foreground">
                {item.pinned ? <Lock className="h-3.5 w-3.5" /> : null}
              </span>
              <item.icon
                className={cn("h-[18px] w-[18px] shrink-0", shown ? "text-foreground" : "text-muted-foreground")}
              />
              <span className={cn("flex-1 font-medium", !shown && "text-muted-foreground")}>
                {item.label}
              </span>
              <span
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                  shown ? "bg-primary" : "bg-muted",
                  item.pinned && "opacity-50",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                    shown ? "translate-x-[22px]" : "translate-x-0.5",
                  )}
                />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
