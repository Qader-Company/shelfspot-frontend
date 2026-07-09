import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/shared/lib/utils";

export function LandingSectionBadge({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-accent px-3 py-1 text-sm font-medium text-primary",
        className,
      )}
      {...props}
    />
  );
}
