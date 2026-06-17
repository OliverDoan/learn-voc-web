import { MobileNav, Nav } from "@/components/nav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex flex-1 min-h-screen">
      <Nav />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <MobileNav />
    </div>
  );
}
