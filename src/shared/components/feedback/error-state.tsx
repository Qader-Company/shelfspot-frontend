"use client";

import { CircleAlert } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

interface ErrorStateProps {
  title: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title,
  description,
  retryLabel,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <section
      className={cn(
        "flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 p-6 text-center",
        className,
      )}
      role="alert"
    >
      <CircleAlert className="size-6 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <h2 className="font-medium">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {onRetry && retryLabel ? (
        <Button type="button" variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </section>
  );
}
