"use client";

import { ThemeProvider } from "next-themes";

import { AccentProvider } from "@/components/providers/accent-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
      storageKey="nexo-theme"
    >
      <AccentProvider>{children}</AccentProvider>
    </ThemeProvider>
  );
}
