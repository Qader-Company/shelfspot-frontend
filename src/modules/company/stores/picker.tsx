"use client";
import { useState } from "react";
import { Dialog } from "radix-ui";
import { MapPin, Search, Store as StoreIcon, X, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useStoreOptionsQuery } from "./hooks";
import { normalizeApiError } from "@/shared/lib/api/errors";
import type { Store } from "./types";

export function StorePicker({ value, onSelect, onClose }: { value: string; onSelect: (store: Store) => void; onClose: () => void }) {
  const t = useTranslations("dashboard.stores");
  const query = useStoreOptionsQuery();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(value);
  const stores = (query.data ?? []).filter(store => store.active);
  const selected = stores.find(store => store.id === selectedId);
  const filtered = stores.filter(store => `${store.name} ${store.number} ${store.address}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  return <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/25" /><Dialog.Content aria-describedby={undefined} className="fixed start-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-card p-5 shadow-xl rtl:translate-x-1/2"><div className="flex items-center justify-between"><Dialog.Title className="text-xl font-bold">{t("selectStore")}</Dialog.Title><Dialog.Close asChild><Button variant="ghost" size="icon-sm" aria-label={t("close")}><X className="size-4" /></Button></Dialog.Close></div><div className="relative my-4"><Search className="absolute start-3 top-3 size-4 text-muted-foreground" /><Input className="ps-9" aria-label={t("search")} placeholder={t("search")} value={search} onChange={event => setSearch(event.target.value)} /></div>
    <div className="min-h-0 overflow-y-auto"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{filtered.map(store => <button key={store.id} type="button" aria-pressed={selectedId === store.id} className={`rounded-xl border p-3 text-start transition ${selectedId === store.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => setSelectedId(store.id)}><div className="flex items-center gap-2"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><StoreIcon className="size-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{store.name}</span><span className="text-xs text-primary">{t("storeNumber", { number: store.number })}</span></span>{selectedId === store.id ? <Check className="size-4 text-primary" /> : null}</div><span className="mt-3 flex items-start gap-1 text-xs text-muted-foreground"><MapPin className="size-3 shrink-0" />{store.address || store.location}</span></button>)}</div>{query.isPending ? <p role="status" className="py-10 text-center">{t("loading")}</p> : query.isError ? <div role="alert" className="space-y-3 py-6"><p>{normalizeApiError(query.error).message}</p><Button onClick={() => void query.refetch()}>{t("retry")}</Button></div> : !filtered.length ? <p role="status" className="py-10 text-center text-muted-foreground">{t("empty")}</p> : null}</div><Button className="mt-5 w-full shrink-0" disabled={!selected || query.isError || query.isPending} onClick={() => { if (selected) onSelect(selected); }}>{t("confirmStore")}</Button>
  </Dialog.Content></Dialog.Portal></Dialog.Root>;
}
