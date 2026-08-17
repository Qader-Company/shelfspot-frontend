import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface ChartCardProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, action, children, className }: ChartCardProps) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6",
        className,
      )}
    >
      {title || action ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-6 sm:gap-4">
          {title ? (
            <h2 className="text-sm font-bold text-foreground">{title}</h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
