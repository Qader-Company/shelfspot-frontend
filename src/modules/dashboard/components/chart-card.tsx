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
        "rounded-lg border border-border bg-card p-6 shadow-sm",
        className,
      )}
    >
      {(title || action) ? (
        <div className="mb-6 flex items-center justify-between gap-4">
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
