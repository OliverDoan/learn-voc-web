"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUiTheme } from "@/hooks/use-ui-theme";
import { GmailShell } from "@/components/gmail/gmail-shell";
import { ClassicNav } from "@/components/classic-nav";

interface AppFrameProps {
  children: React.ReactNode;
}

/** Chọn khung dashboard theo kiểu giao diện trong Cài đặt: Gmail hoặc Cổ điển. */
export function AppFrame({ children }: AppFrameProps) {
  const uiTheme = useUiTheme();
  const pathname = usePathname();

  // Metadata đặt tên "Gmail"; giao diện Cổ điển trả lại tên cũ trên tab.
  useEffect(() => {
    if (uiTheme === "classic") document.title = document.title.replace(/Gmail/g, "VocaLearn");
  }, [uiTheme, pathname]);

  if (uiTheme === "classic") {
    return (
      <div className="flex min-h-screen flex-1">
        <ClassicNav />
        <main className="min-w-0 flex-1 pb-20 md:pb-0">{children}</main>
      </div>
    );
  }
  return <GmailShell>{children}</GmailShell>;
}
