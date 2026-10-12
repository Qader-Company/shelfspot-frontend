"use client";

import { useTranslations } from "next-intl";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import { ShelfSelect } from "@/shared/ui/shelf-select";

export function WorkerSearchFilters({ search, radiusKm, disabled, onSearch, onRadius }: {
  search: string;
  radiusKm: number;
  disabled: boolean;
  onSearch: (value: string) => void;
  onRadius: (value: number) => void;
}) {
  const t = useTranslations("adminDashboard.requests.details.assignDialog");
  return <div className="space-y-2">
    <label className="block text-xs font-medium text-muted-foreground" htmlFor="admin-worker-radius">{t("radius")}</label>
    <ShelfSelect id="admin-worker-radius" value={radiusKm} disabled={disabled} className="w-full" onChange={(event) => onRadius(Number(event.target.value))}>
      {[5, 10, 15, 20, 50, 100].map((km) => <option key={km} value={km}>{t("radiusValue", { km })}</option>)}
    </ShelfSelect>
    <SearchInput label={t("search")} placeholder={t("search")} value={search} disabled={disabled} onChange={(event) => onSearch(event.target.value)} />
  </div>;
}
