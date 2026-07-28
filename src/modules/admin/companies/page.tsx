"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, CircleCheck, CircleOff, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { DeleteConfirmDialog } from "@/shared/components/dashboard/delete-confirm-dialog";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import { StatusToggle } from "@/shared/components/dashboard/status-toggle";
import { EmptyState, ErrorState, PageLoadingSkeleton } from "@/shared/components/feedback";
import { Link } from "@/i18n/navigation";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import {
  useCompanies,
  useDeleteCompany,
  useUpdateCompanyStatus,
} from "./hooks";
import type { AdminCompany } from "./types";

function isActive(company: AdminCompany) {
  return company.active ?? (
    company.is_active === true ||
    company.is_active === 1 ||
    company.is_active === "1"
  );
}

function industryName(company: AdminCompany) {
  return typeof company.industry === "string"
    ? company.industry
    : company.industry?.name ?? "—";
}

export function CompaniesPage() {
  const t = useTranslations("adminDashboard.companies");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const companies = useCompanies({ search: deferredSearch || undefined, page, per_page: 10 });
  const statusMutation = useUpdateCompanyStatus();
  const deleteMutation = useDeleteCompany();
  const rows = useMemo(
    () =>
      (companies.data?.data ?? []).filter((company) =>
        status === "all" ? true : isActive(company) === (status === "active"),
      ),
    [companies.data?.data, status],
  );
  const total = companies.data?.meta?.total ?? companies.data?.data.length ?? 0;
  const active = (companies.data?.data ?? []).filter(isActive).length;
  const inactive = Math.max(total - active, 0);
  const current = companies.data?.meta?.current_page ?? page;
  const last = Math.max(companies.data?.meta?.last_page ?? 1, 1);
  const pages = Array.from({ length: Math.min(last, 5) }, (_, index) => index + 1);

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["admin", "companies"] });
  }

  async function toggle(company: AdminCompany) {
    setActionError("");
    try {
      await statusMutation.mutateAsync({ id: String(company.id), isActive: !isActive(company) });
      await refresh();
    } catch (error) {
      setActionError(normalizeApiError(error).message || t("errors.status"));
    }
  }

  async function remove() {
    if (!deleteId) return;
    setActionError("");
    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
      await refresh();
    } catch (error) {
      setActionError(normalizeApiError(error).message || t("errors.delete"));
    }
  }

  const stats = [
    { label: t("stats.total"), value: total, icon: Building2, tone: "bg-primary/10 text-primary" },
    { label: t("stats.active"), value: active, icon: CircleCheck, tone: "bg-success/10 text-success" },
    { label: t("stats.inactive"), value: inactive, icon: CircleOff, tone: "bg-destructive/10 text-destructive" },
  ];

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      <div><h1 className="text-3xl font-bold">{t("title")}</h1><p className="mt-2 text-muted-foreground">{t("subtitle")}</p></div>
      <div className="grid gap-4 md:grid-cols-3">{stats.map(({ label, value, icon: Icon, tone }) => <div key={label} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"><span className={cn("rounded-full p-3", tone)}><Icon className="size-5" /></span><div><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold">{value}</p></div></div>)}</div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><SearchInput label={t("searchLabel")} placeholder={t("searchPlaceholder")} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="max-w-sm" /><select aria-label={t("statusFilterLabel")} value={status} onChange={(event) => { setStatus(event.target.value as typeof status); setPage(1); }} className="h-10 rounded-lg border border-border bg-card px-3"><option value="all">{t("statuses.all")}</option><option value="active">{t("statuses.active")}</option><option value="inactive">{t("statuses.inactive")}</option></select></div>
      {actionError ? <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{actionError}</p> : null}
      {companies.isLoading ? <PageLoadingSkeleton showHeader={false} cardCount={3} tableRows={6} tableColumns={6} label={t("loading")} className="px-0 py-0" /> : companies.isError ? <ErrorState title={t("errors.load")} description={normalizeApiError(companies.error).message} retryLabel={t("retry")} onRetry={() => companies.refetch()} /> : rows.length === 0 ? <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} /> : <div className="overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full min-w-[780px] text-sm"><thead><tr className="border-b border-border text-start"><th className="p-4 text-start">{t("columns.name")}</th><th className="p-4 text-start">{t("columns.industry")}</th><th className="p-4 text-start">{t("columns.crNumber")}</th><th className="p-4 text-start">{t("columns.email")}</th><th className="p-4 text-start">{t("columns.status")}</th><th className="p-4 text-start">{t("columns.action")}</th></tr></thead><tbody>{rows.map((company) => <tr key={company.id} className="border-b border-border last:border-0"><td className="p-4"><Link href={`/admin/companies/${company.id}`} className="flex items-center gap-3 font-semibold hover:text-primary"><span className="rounded-full bg-success/10 p-2 text-success"><Building2 className="size-4" /></span><span>{company.name}<small className="block font-normal text-muted-foreground">{company.country ?? "—"}</small></span></Link></td><td className="p-4">{industryName(company)}</td><td className="p-4">{company.cr_number ?? "—"}</td><td className="p-4">{company.work_email ?? company.email ?? "—"}</td><td className="p-4"><button type="button" disabled={statusMutation.isPending} onClick={() => toggle(company)}><StatusToggle isActive={isActive(company)} ariaLabel={t("toggleStatus", { name: company.name })} /></button></td><td className="p-4"><Button type="button" variant="ghost" size="icon-sm" aria-label={t("delete", { name: company.name })} onClick={() => setDeleteId(String(company.id))}><Trash2 className="size-4" /></Button></td></tr>)}</tbody></table></div>}
      <div className="flex items-center justify-between"><Button variant="outline" disabled={current <= 1 || companies.isFetching} onClick={() => setPage((value) => value - 1)}>{t("pagination.previous")}</Button><div className="flex gap-1">{pages.map((value) => <Button key={value} variant="ghost" className={cn(value === current && "bg-primary/15")} onClick={() => setPage(value)}>{value}</Button>)}</div><Button variant="outline" disabled={current >= last || companies.isFetching} onClick={() => setPage((value) => value + 1)}>{t("pagination.next")}</Button></div>
      <DeleteConfirmDialog isOpen={Boolean(deleteId)} title={t("deleteDialog.title")} descriptionLine1={t("deleteDialog.description")} descriptionLine2={t("deleteDialog.warning")} cancelLabel={t("deleteDialog.cancel")} confirmLabel={t("deleteDialog.confirm")} onClose={() => setDeleteId(null)} onConfirm={remove} isPending={deleteMutation.isPending} errorMessage={actionError} />
    </div>
  );
}
