import { Star } from "lucide-react";

import type { RankedCompany, RankedWorker } from "./admin-dashboard.seed";

interface AdminRankingCardProps {
  title: string;
  items: RankedCompany[] | RankedWorker[];
  requestLabel: (count: number) => string;
  completedLabel: (count: number) => string;
  formatCurrency: (value: number) => string;
  resolveName: (key: string) => string;
  workerList?: boolean;
}

export function AdminRankingCard({ title, items, requestLabel, completedLabel, formatCurrency, resolveName, workerList = false }: AdminRankingCardProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <ol className="mt-4 divide-y divide-border">
        {items.map((item, index) => {
          const worker = workerList ? item as RankedWorker : null;
          const company = workerList ? null : item as RankedCompany;
          return (
            <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-medium text-primary">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{resolveName(item.nameKey)}</p>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{worker ? completedLabel(worker.completedCount) : requestLabel(company?.requestCount ?? 0)}</span>
                  {worker ? <><Star className="size-3 fill-warning text-warning" aria-hidden="true" /><span>{worker.rating}</span></> : null}
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold text-foreground">+{formatCurrency(worker?.earnings ?? company?.revenue ?? 0)}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
