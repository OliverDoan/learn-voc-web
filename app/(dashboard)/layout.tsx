import { MobileNav } from "@/components/nav";
import { AppFrame } from "@/components/app-frame";
import { StudyReminder } from "@/components/study-reminder";
import { SettingsDialogProvider } from "@/components/settings/settings-dialog";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SettingsDialogProvider>
      <AppFrame>{children}</AppFrame>
      <MobileNav />
      <StudyReminder />
    </SettingsDialogProvider>
  );
}
