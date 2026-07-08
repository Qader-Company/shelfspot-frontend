import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/shared/lib/utils";

export function LandingContainer({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8",
        className,
      )}
      {...props}
    />
  );
}
