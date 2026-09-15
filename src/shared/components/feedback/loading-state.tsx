import { LoaderCircle } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface LoadingStateProps {
  label: string;
  className?: string;
}

export function LoadingState({ label, className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-40 flex-col items-center justify-center gap-3 text-muted-foreground",
        className,
      )}
      role="status"
    >
      <span className="flex size-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10"><LoaderCircle className="shelfspot-loader size-7 animate-spin text-primary" aria-hidden="true" /></span>
      <span className="text-sm">{label}</span>
    </div>
  );
}
