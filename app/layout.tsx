import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PwaRegister } from "@/components/pwa-register";
import { THEME_STORAGE_KEY } from "@/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VocaLearn - Học từ vựng cá nhân",
  description: "Ứng dụng học từ vựng cá nhân với Spaced Repetition và truyện chêm.",
  applicationName: "VocaLearn",
  appleWebApp: {
    capable: true,
    title: "VocaLearn",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const themeBootstrap = `
(function(){
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var theme = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    var resolved = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
      : theme;
    var root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
  } catch (e) {
    document.documentElement.classList.add("dark");
  }
})();
`.trim();

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
        <PwaRegister />
      </body>
    </html>
  );
}
