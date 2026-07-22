import { cn } from "@/shared/lib/utils";

interface PageLoadingSkeletonProps {
  className?: string;
  showHeader?: boolean;
  actionCount?: number;
  cardCount?: number;
  chartCount?: number;
  tableRows?: number;
  tableColumns?: number;
  label?: string;
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block animate-pulse rounded-md bg-muted", className)}
    />
  );
}

export function PageLoadingSkeleton({
  className,
  showHeader = true,
  actionCount = 0,
  cardCount = 0,
  chartCount = 0,
  tableRows = 0,
  tableColumns = 5,
  label = "Loading page",
}: PageLoadingSkeletonProps) {
  return (
    <div
      className={cn("space-y-6 px-4 py-8 lg:px-8", className)}
      role="status"
      aria-label={label}
    >
      {showHeader ? (
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <SkeletonBlock className="h-9 w-44" />
            <SkeletonBlock className="h-5 w-72 max-w-full" />
          </div>
          {actionCount > 0 ? (
            <div className="flex gap-3">
              {Array.from({ length: actionCount }, (_, index) => (
                <SkeletonBlock key={index} className="h-10 w-32" />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {cardCount > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: cardCount }, (_, index) => (
            <div key={index} className="flex h-24 items-center gap-4 rounded-lg border border-border bg-card p-5">
              <SkeletonBlock className="size-12 shrink-0 rounded-full" />
              <div className="flex-1 space-y-3">
                <SkeletonBlock className="h-3 w-3/4" />
                <SkeletonBlock className="h-6 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {chartCount > 0 ? (
        <div className={cn("grid gap-6", chartCount > 1 && "xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,1fr)]")}>
          {Array.from({ length: chartCount }, (_, index) => (
            <div key={index} className="space-y-5 rounded-lg border border-border bg-card p-5">
              <SkeletonBlock className="h-5 w-40" />
              <SkeletonBlock className="h-56 w-full" />
            </div>
          ))}
        </div>
      ) : null}

      {tableRows > 0 ? (
        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
          <SkeletonBlock className="h-6 w-32" />
          {Array.from({ length: tableRows }, (_, row) => (
            <div key={row} className="grid gap-4 border-t border-border pt-4" style={{ gridTemplateColumns: `repeat(${tableColumns}, minmax(0, 1fr))` }}>
              {Array.from({ length: tableColumns }, (_, column) => (
                <SkeletonBlock key={column} className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
