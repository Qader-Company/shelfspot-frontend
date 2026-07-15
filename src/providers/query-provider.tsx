"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

import { setupApiClient } from "@/shared/lib/api/client";
import { getQueryClient } from "@/shared/lib/query/client";

export function QueryProvider({ children }: { children: ReactNode }) {
  // Register auth interceptors before any descendant query can execute.
  setupApiClient();
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  );
}
