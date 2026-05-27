"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "./theme-provider";
import { ShortcutsModal } from "./shortcuts-modal";
import { CommandPalette } from "./command-palette";

function AppToaster() {
  const { resolved } = useTheme();
  return (
    <Toaster
      theme={resolved}
      position="top-right"
      richColors
      closeButton
      toastOptions={{ duration: 3000 }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <CommandPalette />
        <ShortcutsModal />
        <AppToaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
