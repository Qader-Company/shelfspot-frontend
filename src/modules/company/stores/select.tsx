"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
import type { Store } from "./types";

/** Controlled selector; the caller supplies stores from the company API. */
export function StoreSelect({ stores, value, onChange, loading, error, onRetry, required = false }: {
  stores: Store[];
  value: string;
  onChange: (store: Store | null) => void;
  loading?: boolean;
  error?: string;
  onRetry: () => void;
  required?: boolean;
}) {
  const t = useTranslations("dashboard.stores");
  const id = useId();
  const activeStores = stores.filter(store => store.active);
  const selected = stores.find(store => store.id === value);
  return <div className="space-y-2"><label htmlFor={id} className="block text-base font-bold">{t("name")}{required ? " *" : ""}</label><select id={id} value={value} required={required} disabled={loading || Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className="h-12 w-full rounded-lg border border-input bg-background px-4 text-sm disabled:opacity-50" onChange={event => onChange(activeStores.find(store => store.id === event.target.value) ?? null)}><option value="">{t(loading ? "loading" : "selectStore")}</option>{value && !activeStores.some(store => store.id === value) ? <option value={value} disabled>{selected?.name ?? value} ({t("inactive")})</option> : null}{activeStores.map(store => <option key={store.id} value={store.id}>{store.name} — {store.number} — {store.address}</option>)}</select>{error ? <div id={`${id}-error`} role="alert" className="space-y-2 text-sm text-destructive"><p>{error}</p><Button type="button" variant="outline" onClick={onRetry}>{t("retry")}</Button></div> : !loading && !activeStores.length ? <p className="text-sm text-muted-foreground">{t("noActiveStores")}</p> : null}</div>;
}
