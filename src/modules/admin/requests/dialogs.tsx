"use client";

import { useDeferredValue, useState } from "react";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog } from "radix-ui";
import { CloseIcon, PaginationNextIcon, PaginationPreviousIcon } from "@/shared/components/dashboard/dashboard-icons";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { useAssignAdminRequest, useReassignmentWorkers } from "./hooks";

export function AssignMerchandiserDialog({ requestId, workerId, workerName, onClose }: { requestId: string; workerId?: string; workerName?: string; onClose: () => void }) {
  const t = useTranslations("adminDashboard.requests.details.assignDialog");
  const [mode, setMode] = useState<"same" | "new">(workerId ? "same" : "new");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search);
  const query = useReassignmentWorkers(page, deferred, mode === "new");
  const mutation = useAssignAdminRequest();
  const selectedId = mode === "same" ? workerId : selected;
  const rows = query.data?.data ?? [];

  function changeMode(next: "same" | "new") { setMode(next); setSelected(""); mutation.reset(); }
  function submit() {
    if (!selectedId || mutation.isPending) return;
    mutation.mutate({ requestId, merchandiserId: selectedId }, { onSuccess: onClose });
  }

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/30" />
        <Dialog.Content className="fixed start-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-border bg-card p-5 shadow-xl rtl:translate-x-1/2">
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="text-lg font-bold">{t("title")}</Dialog.Title>
            <Dialog.Close asChild><Button variant="ghost" size="icon-sm" aria-label={t("close")} disabled={mutation.isPending} className="rounded-full"><CloseIcon className="size-4" /></Button></Dialog.Close>
          </div>
          <Dialog.Description className="mt-1 text-xs text-muted-foreground">{t("subtitle")}</Dialog.Description>
          <div className="mt-4 flex gap-2">
            {(["same", "new"] as const).map((option) => <Button key={option} variant="outline" disabled={mutation.isPending || (option === "same" && !workerId)} aria-pressed={mode === option} onClick={() => changeMode(option)} className={cn("flex-1 text-xs", mode === option && "border-primary bg-primary/10 text-primary")}>{t(option === "same" ? "sameWorker" : "newWorker")}</Button>)}
          </div>
          <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
            {mode === "same" ? <div className="rounded-xl border border-primary bg-primary/5 p-4"><p className="text-xs text-muted-foreground">{t("sameWorker")}</p><p className="mt-1 text-sm font-semibold">{workerName ?? `#${workerId}`}</p></div> : <>
              <SearchInput label={t("search")} placeholder={t("search")} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); setSelected(""); mutation.reset(); }} />
              {query.isPending ? <p role="status" className="py-6 text-center text-sm text-muted-foreground">{t("loading")}</p>
                : query.isError ? <div role="alert" className="py-4 text-sm text-destructive"><p>{normalizeApiError(query.error).message || t("loadError")}</p><Button variant="outline" className="mt-2" onClick={() => void query.refetch()}>{t("retry")}</Button></div>
                  : !rows.length ? <p className="py-6 text-center text-sm text-muted-foreground">{t("empty")}</p>
                    : <div className="mt-4 space-y-2">{rows.map((item) => <button key={item.id} type="button" disabled={!item.available || mutation.isPending} aria-pressed={selected === item.id} onClick={() => { setSelected(item.id); mutation.reset(); }} className={cn("w-full rounded-xl border p-3 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50", selected === item.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                      <div className="flex items-center justify-between gap-2"><strong className="text-sm">{item.name}</strong><span className={cn("rounded-full px-2 py-0.5 text-xs", item.available ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>{item.available ? t("available") : t("busy")}</span></div>
                      <p className="mt-1 text-xs text-muted-foreground">{item.phone}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground"><span>{item.tasks} {t("tasks")}</span><span className="flex items-center gap-1"><Star aria-hidden="true" className="size-3" />{item.rating}</span></div>
                    </button>)}</div>}
              {(query.data?.lastPage ?? 1) > 1 ? <div className="mt-4 flex items-center justify-between"><Button variant="outline" size="icon-sm" aria-label={t("previous")} disabled={query.isFetching || mutation.isPending || page <= 1} onClick={() => { setPage(page - 1); setSelected(""); }}><PaginationPreviousIcon className="size-4 rtl:rotate-180" /></Button><span className="text-xs text-muted-foreground">{page} / {query.data?.lastPage}</span><Button variant="outline" size="icon-sm" aria-label={t("next")} disabled={query.isFetching || mutation.isPending || page >= (query.data?.lastPage ?? 1)} onClick={() => { setPage(page + 1); setSelected(""); }}><PaginationNextIcon className="size-4 rtl:rotate-180" /></Button></div> : null}
            </>}
          </div>
          {mutation.isError ? <p role="alert" className="mt-3 text-sm text-destructive">{normalizeApiError(mutation.error).message || t("unverified")}</p> : null}
          <Button className="mt-4 h-11 w-full rounded-lg text-sm font-semibold" onClick={submit} disabled={!selectedId || mutation.isPending || (mode === "new" && (query.isFetching || query.isError))}>{mutation.isPending ? t("assigning") : t("assign")}</Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
