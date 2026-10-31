"use client";

import { Suspense, useState } from "react";
import { cn } from "@/lib/utils";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";
import { TopBar } from "./top-bar";
import { AppRail } from "./app-rail";
import { MailSidebar } from "./mail-sidebar";
import { SidePanel } from "./side-panel";
import { ComposeWindow } from "./compose-window";

interface GmailShellProps {
  children: React.ReactNode;
}

const DESKTOP_QUERY = "(min-width: 768px)";

/**
 * Khung giao diện kiểu Gmail cho mọi trang dashboard: top bar, rail trái,
 * sidebar thư mục/nhãn, vùng nội dung trắng bo góc và thanh add-on bên phải.
 * Trang vẫn cuộn theo cửa sổ (nhiều tính năng dựa vào window scroll).
 */
export function GmailShell({ children }: GmailShellProps) {
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

  // ☰: desktop thu gọn sidebar, mobile mở drawer.
  const onMenuClick = () => {
    if (window.matchMedia(DESKTOP_QUERY).matches) toggleCollapsed();
    else setDrawerOpen(true);
  };
  const openCompose = () => {
    setDrawerOpen(false);
    setComposeOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background">
      {/* useSearchParams cần Suspense để không chặn render tĩnh */}
      <Suspense fallback={<div className="h-16" />}>
        <TopBar onMenuClick={onMenuClick} />
      </Suspense>

      <div className="flex flex-1">
        <div className="sticky top-16 hidden h-[calc(100vh-4rem)] md:flex">
          <AppRail />
          <div className="overflow-y-auto">
            <Suspense fallback={null}>
              <MailSidebar collapsed={collapsed} onCompose={openCompose} />
            </Suspense>
          </div>
        </div>

        <main
          className={cn(
            "min-w-0 flex-1 bg-card pb-20 md:mb-4 md:min-h-[calc(100vh-5rem)] md:rounded-2xl md:pb-0 lg:mr-0",
            "md:mr-4",
          )}
        >
          {children}
        </main>

        <div className="sticky top-16 hidden h-[calc(100vh-4rem)] lg:block">
          <SidePanel />
        </div>
      </div>

      {drawerOpen ? (
        <div className="md:hidden">
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 overflow-y-auto bg-background pt-3 shadow-xl">
            <Suspense fallback={null}>
              <MailSidebar
                collapsed={false}
                onCompose={openCompose}
                onNavigate={() => setDrawerOpen(false)}
              />
            </Suspense>
          </div>
        </div>
      ) : null}

      {composeOpen ? (
        <Suspense fallback={null}>
          <ComposeWindow onClose={() => setComposeOpen(false)} />
        </Suspense>
      ) : null}
    </div>
  );
}
