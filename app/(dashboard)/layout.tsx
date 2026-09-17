import { MobileNav, Nav } from "@/components/nav";
import { StudyReminder } from "@/components/study-reminder";
import { SettingsDialogProvider } from "@/components/settings/settings-dialog";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SettingsDialogProvider>
      <div className="flex flex-1 min-h-screen">
        <Nav />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <MobileNav />
        <StudyReminder />
      </div>
    </SettingsDialogProvider>
  );
}
