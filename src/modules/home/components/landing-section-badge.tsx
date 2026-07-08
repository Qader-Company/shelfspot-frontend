import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/shared/lib/utils";

export function LandingSectionBadge({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-primary/15 bg-accent px-4 py-2 text-sm font-medium text-primary",
        className,
      )}
      {...props}
    />
  );
}
