"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { setupApiClient } from "@/shared/lib/api/client";
import { Toaster } from "@/shared/components/ui/toaster";

export function AppProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    setupApiClient();
  }, []);

  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
        <Toaster />
      </QueryProvider>
    </ThemeProvider>
  );
}
