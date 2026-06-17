import type { Metadata, Viewport } from "next";
import {
  Be_Vietnam_Pro,
  DM_Sans,
  Lora,
  Poppins,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PwaRegister } from "@/components/pwa-register";
import { THEME_STORAGE_KEY } from "@/lib/theme";

// NewEra Inc. Design System fonts
const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin", "vietnamese"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  style: ["normal", "italic"],
  subsets: ["latin", "vietnamese"],
});

const fontVars = `${beVietnam.variable} ${poppins.variable} ${dmSans.variable} ${spaceGrotesk.variable} ${lora.variable}`;

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
    { media: "(prefers-color-scheme: light)", color: "#173dc9" },
    { media: "(prefers-color-scheme: dark)", color: "#00021f" },
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
    var theme = stored === "light" || stored === "dark" || stored === "system" ? stored : "light";
    var resolved = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    var root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
  } catch (e) {
    document.documentElement.style.colorScheme = "light";
  }
})();
`.trim();

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html
      lang="vi"
      className={`${fontVars} h-full antialiased`}
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
