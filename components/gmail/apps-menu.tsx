"use client";

import Link from "next/link";
import { Grip } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav-items";
import { usePopover } from "@/hooks/use-popover";
import { useSettingsDialog } from "@/components/settings/settings-dialog";
import { IconButton } from "./icon-button";

/** Lưới "ứng dụng" (⋮⋮⋮) — lối tắt tới mọi trang của app, giống Google apps. */
export function AppsMenu() {
  const { open, setOpen, ref } = usePopover<HTMLDivElement>();
  const settings = useSettingsDialog();

  return (
    <div ref={ref} className="relative">
      <IconButton label="Các trang" onClick={() => setOpen(!open)}>
        <Grip className="h-6 w-6" />
      </IconButton>
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[328px] rounded-3xl bg-popover p-3 shadow-[0_4px_8px_3px_rgba(0,0,0,.15),0_1px_3px_rgba(0,0,0,.3)]">
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-card p-2">
            {NAV_ITEMS.map((item) => {
              const body = (
                <>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="line-clamp-1 text-xs">{item.label}</span>
                </>
              );
              const cls =
                "flex flex-col items-center gap-1.5 rounded-xl px-1 py-3 text-center hover:bg-mail-hover";
              if (item.href === "/settings") {
                return (
                  <button
                    key={item.href}
                    type="button"
                    className={cls}
                    onClick={() => {
                      setOpen(false);
                      settings?.openSettings();
                    }}
                  >
                    {body}
                  </button>
                );
              }
              return (
                <Link key={item.href} href={item.href} className={cls} onClick={() => setOpen(false)}>
                  {body}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
