"use client";

import { useDeferredValue, useState } from "react";
import { useTranslations } from "next-intl";
import { WorkerSearchFilters } from "./worker-search-filters";
import { PaginationNextIcon, PaginationPreviousIcon } from "@/shared/components/dashboard/dashboard-icons";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { ShelfSelect } from "@/shared/ui/shelf-select";
import { useReassignmentWorkers } from "./hooks";
import styles from "./request-motion.module.css";

export function ReopenWorkerPicker({ requestId, currentWorkerId, currentWorkerName, selectedId, disabled, onSelect }: {
  requestId: string;
  currentWorkerId?: string;
  currentWorkerName?: string;
  selectedId: string;
  disabled: boolean;
  onSelect: (workerId: string) => void;
}) {
  const t = useTranslations("adminDashboard.requests.details.assignDialog");
  const [mode, setMode] = useState<"same" | "new">(currentWorkerId ? "same" : "new");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [radiusKm, setRadiusKm] = useState(100);
  const deferred = useDeferredValue(search);
  const query = useReassignmentWorkers(requestId, radiusKm, page, deferred, mode === "new");

  return <div className="mt-4 space-y-3">
    <div className="flex gap-2">
      {(["same", "new"] as const).map((option) => <Button key={option} type="button" variant="outline" disabled={disabled || (option === "same" && !currentWorkerId)} aria-pressed={mode === option} className={cn(styles.choice, "flex-1 text-xs", mode === option && "border-primary bg-primary/10 text-primary")} onClick={() => {
        setMode(option); setSearch(""); setPage(1); onSelect(option === "same" ? currentWorkerId ?? "" : "");
      }}>{t(option === "same" ? "sameWorker" : "newWorker")}</Button>)}
    </div>
    <div key={mode} className={`${styles.body} space-y-3`}>
    {mode === "same" ? <div className="rounded-lg border border-primary bg-primary/5 p-3"><p className="text-xs text-muted-foreground">{t("sameWorker")}</p><p className="mt-1 text-sm font-semibold">{currentWorkerName ?? `#${currentWorkerId}`}</p></div> : <>
      <WorkerSearchFilters search={search} radiusKm={radiusKm} disabled={disabled} onSearch={(value) => { setSearch(value); setPage(1); onSelect(""); }} onRadius={(value) => { setRadiusKm(value); setPage(1); onSelect(""); }} />
      {query.isPending ? <p role="status" className="text-sm text-muted-foreground">{t("loading")}</p>
        : query.isError ? <div role="alert" className="text-sm text-destructive"><p>{normalizeApiError(query.error).message || t("loadError")}</p><Button type="button" variant="outline" size="sm" className="mt-2" disabled={disabled} onClick={() => void query.refetch()}>{t("retry")}</Button></div>
          : !query.data?.data.length ? <p className="text-sm text-muted-foreground">{t("empty")}</p>
            : <ShelfSelect value={selectedId} disabled={disabled || query.isFetching} aria-label={t("newWorker")} className="w-full" onChange={(event) => onSelect(event.target.value)}>
              <option value="">{t("selectRequired")}</option>
              {query.data.data.map((worker) => <option key={worker.id} value={worker.id}>{worker.name} — {worker.phone}{worker.available ? "" : ` (${t("busy")})`}</option>)}
            </ShelfSelect>}
      {(query.data?.lastPage ?? 1) > 1 ? <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" size="icon-sm" aria-label={t("previous")} disabled={disabled || query.isFetching || page <= 1} onClick={() => { setPage(page - 1); onSelect(""); }}><PaginationPreviousIcon className="size-4 rtl:rotate-180" /></Button>
        <span className="text-xs text-muted-foreground">{page} / {query.data?.lastPage}</span>
        <Button type="button" variant="outline" size="icon-sm" aria-label={t("next")} disabled={disabled || query.isFetching || page >= (query.data?.lastPage ?? 1)} onClick={() => { setPage(page + 1); onSelect(""); }}><PaginationNextIcon className="size-4 rtl:rotate-180" /></Button>
      </div> : null}
    </>}
    </div>
  </div>;
}
