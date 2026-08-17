import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  variant?: "card" | "plain";
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  variant = "card",
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "flex min-h-40 flex-col items-center justify-center gap-3 text-center",
        variant === "card" && "rounded-lg border border-dashed p-6",
        className,
      )}
    >
      {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      <div className="space-y-1">
        <h2 className="font-medium">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </section>
  );
}
