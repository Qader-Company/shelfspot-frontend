import type { ComponentProps, CSSProperties } from "react";

import { cn } from "@/shared/lib/utils";

type ScrollableTableProps = ComponentProps<"div"> & {
  /** Maximum height, also capped at 65% of the viewport by the shared styles. */
  maxHeight?: CSSProperties["maxHeight"];
};

/** Scroll container for a table with a sticky header and keyboard scrolling. */
export function ScrollableTable({
  children,
  className,
  maxHeight,
  style,
  tabIndex = 0,
  ...props
}: ScrollableTableProps) {
  const height = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;

  return (
    <div
      {...props}
      tabIndex={tabIndex}
      className={cn("table-scroll", className)}
      style={{
        ...(height ? { "--table-scroll-height": height } : {}),
        ...style,
      } as CSSProperties}
    >
      {children}
    </div>
  );
}
