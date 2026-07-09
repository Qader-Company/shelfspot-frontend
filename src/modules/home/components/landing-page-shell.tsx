import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface LandingPageShellProps {
  children: ReactNode;
  className?: string;
}

export function LandingPageShell({
  children,
  className,
}: LandingPageShellProps) {
  return (
    <main className={cn("min-h-dvh bg-card text-foreground", className)}>
      {children}
    </main>
  );
}
