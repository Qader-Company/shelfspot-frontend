"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Eye,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { SearchInput } from "@/shared/components/dashboard/search-input";
import { StatusBadge } from "@/shared/components/dashboard/status-badge";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

import { useApproveWithdrawal, usePayments, useWithdrawals } from "./hooks";
import type { PaymentStatus, WithdrawalStatus } from "./types";

const PER_PAGE = 8;

type Tab = "companies" | "merchandiser";

export function AdminPaymentsPage() {
  const t = useTranslations("adminPayments");
  const [tab, setTab] = useState<Tab>("companies");

  return (
    <main className="space-y-6 px-4 py-8 lg:px-8">
      <header>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{t("subtitle")}</p>
      </header>

      {/* Tabs */}
      <div role="tablist" className="inline-flex rounded-xl border bg-card p-1 gap-1">
        <button
          role="tab"
          aria-selected={tab === "companies"}
          onClick={() => setTab("companies")}
          className={cn(
            "rounded-lg px-5 py-2 text-sm font-medium transition-colors",
            tab === "companies"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t("tabs.companies")}
        </button>
        <button
          role="tab"
          aria-selected={tab === "merchandiser"}
          onClick={() => setTab("merchandiser")}
          className={cn(
            "rounded-lg px-5 py-2 text-sm font-medium transition-colors",
            tab === "merchandiser"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t("tabs.merchandiser")}
        </button>
      </div>

      {tab === "companies" ? <CompaniesTab /> : <MerchandiserTab />}
    </main>
  );
}

// ─── Companies Tab ────────────────────────────────────────────────────────────

function CompaniesTab() {
  const t = useTranslations("adminPayments");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | PaymentStatus>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const { data: response, isLoading, isError } = usePayments({
    page,
    per_page: PER_PAGE,
    search: search || undefined,
    status: status === "all" ? undefined : status,
    sort,
  });

  const rows = response?.data ?? [];
  const meta = response?.meta;
  const pages = meta ? Math.max(1, meta.last_page) : 1;

  const incoming = response?.summary?.total_incoming ?? 0;
  const outgoing = response?.summary?.total_outgoing ?? 0;
  const balance = response?.summary?.net_balance ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Summary label={t("summary.incoming")} value={incoming} tone="text-primary bg-primary/10" />
        <Summary label={t("summary.outgoing")} value={outgoing} tone="text-destructive bg-destructive/10" />
        <Summary label={t("summary.balance")} value={balance} tone="text-accent-foreground bg-accent" signed />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput
          label={t("searchLabel")}
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-md"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          aria-label={t("dateFilter")}
          className="h-11 rounded-lg border bg-card px-4 md:ms-auto"
        >
          <option value="newest">{t("dates.newest")}</option>
          <option value="oldest">{t("dates.oldest")}</option>
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }}
          aria-label={t("statusFilter")}
          className="h-11 rounded-lg border bg-card px-4"
        >
          <option value="all">{t("statuses.all")}</option>
          {(["completed", "failed", "refunded"] as PaymentStatus[]).map((x) => (
            <option key={x} value={x}>{t(`statuses.${x}`)}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr>
              {["company", "spending", "date", "status", "action"].map((h, i) => (
                <th key={h} className="border-b border-e p-4 text-start font-medium last:border-e-0">
                  {i === 0 && (
                    <input
                      className="me-3"
                      type="checkbox"
                      aria-label={t("selectAll")}
                      checked={rows.length > 0 && rows.every((x) => selected.includes(String(x.id)))}
                      onChange={(e) => setSelected(e.target.checked ? rows.map((x) => String(x.id)) : [])}
                    />
                  )}{" "}
                  {t(`columns.${h}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  <Loader2 className="mx-auto size-6 animate-spin" />
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-destructive">
                  {t("error")}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  {t("empty")}
                </td>
              </tr>
            ) : (
              rows.map((x) => (
                <tr className="border-b last:border-0" key={x.id}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        aria-label={t("select", { name: x.company.name })}
                        checked={selected.includes(String(x.id))}
                        onChange={() =>
                          setSelected((v) =>
                            v.includes(String(x.id))
                              ? v.filter((id) => id !== String(x.id))
                              : [...v, String(x.id)],
                          )
                        }
                      />
                      <div>
                        <strong>{x.company.name}</strong>
                        <span className="block text-muted-foreground">{x.company.email ?? "—"}</span>
                      </div>
                    </div>
                  </td>
                  <td className={cn("p-4 font-medium", x.direction === "incoming" ? "text-success" : "text-destructive")}>
                    {x.amount.toLocaleString()}${" "}
                    {x.direction === "incoming"
                      ? <ArrowUpRight className="inline size-4" />
                      : <ArrowDownRight className="inline size-4" />}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(x.date).toLocaleDateString(undefined, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4">
                    <StatusBadge
                      status={x.status}
                      label={x.status_label ?? t(`statuses.${x.status}`)}
                    />
                  </td>
                  <td className="p-4">
                    <Button asChild variant="ghost" size="icon-sm" aria-label={t("view", { name: x.company.name })}>
                      <Link href={`/admin/payments/${encodeURIComponent(x.id)}`}>
                        <Eye />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={pages} loading={isLoading} onPage={setPage} />
    </div>
  );
}

// ─── Merchandiser Tab ─────────────────────────────────────────────────────────

function MerchandiserTab() {
  const t = useTranslations("adminPayments");
  const tw = useTranslations("adminPayments.merchandiser");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | WithdrawalStatus>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const { data: response, isLoading, isError } = useWithdrawals({
    page,
    per_page: PER_PAGE,
    search: search || undefined,
    status: status === "all" ? undefined : status,
    sort,
  });

  const approve = useApproveWithdrawal();

  const rows = response?.data ?? [];
  const meta = response?.meta;
  const pages = meta ? Math.max(1, meta.last_page) : 1;

  const totalRequests = response?.summary?.total_withdraw_requests ?? 0;
  const pendingRequests = response?.summary?.pending_withdraw_requests ?? 0;
  const totalWithdraw = response?.summary?.total_withdraw ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Summary label={tw("summary.totalRequests")} value={totalRequests} tone="text-primary bg-primary/10" />
        <Summary label={tw("summary.pendingRequests")} value={pendingRequests} tone="text-destructive bg-destructive/10" />
        <Summary label={tw("summary.totalWithdraw")} value={totalWithdraw} tone="text-accent-foreground bg-accent" signed />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput
          label={tw("searchLabel")}
          placeholder={tw("searchPlaceholder")}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-md"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          aria-label={t("dateFilter")}
          className="h-11 rounded-lg border bg-card px-4 md:ms-auto"
        >
          <option value="newest">{t("dates.newest")}</option>
          <option value="oldest">{t("dates.oldest")}</option>
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }}
          aria-label={t("statusFilter")}
          className="h-11 rounded-lg border bg-card px-4"
        >
          <option value="all">{t("statuses.all")}</option>
          {(["pending", "approved", "rejected"] as WithdrawalStatus[]).map((x) => (
            <option key={x} value={x}>{tw(`statuses.${x}`)}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr>
              {["name", "amount", "iban", "date", "action"].map((h, i) => (
                <th key={h} className="border-b border-e p-4 text-start font-medium last:border-e-0">
                  {i === 0 && (
                    <input
                      className="me-3"
                      type="checkbox"
                      aria-label={t("selectAll")}
                      checked={rows.length > 0 && rows.every((x) => selected.includes(String(x.id)))}
                      onChange={(e) => setSelected(e.target.checked ? rows.map((x) => String(x.id)) : [])}
                    />
                  )}{" "}
                  {tw(`columns.${h}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  <Loader2 className="mx-auto size-6 animate-spin" />
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-destructive">
                  {tw("error")}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  {tw("empty")}
                </td>
              </tr>
            ) : (
              rows.map((x) => (
                <tr className="border-b last:border-0" key={x.id}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        aria-label={t("select", { name: x.merchandiser.name })}
                        checked={selected.includes(String(x.id))}
                        onChange={() =>
                          setSelected((v) =>
                            v.includes(String(x.id))
                              ? v.filter((id) => id !== String(x.id))
                              : [...v, String(x.id)],
                          )
                        }
                      />
                      <div>
                        <strong>{x.merchandiser.name}</strong>
                        <span className="block text-muted-foreground">
                          {x.merchandiser.email ?? "—"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-success">
                    {x.amount.toLocaleString()}$
                  </td>
                  <td className="p-4 text-muted-foreground font-mono tracking-wide">
                    {x.iban ?? "—"}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(x.date).toLocaleDateString(undefined, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4">
                    {x.status === "pending" ? (
                      <Button
                        size="sm"
                        disabled={approve.isPending && approve.variables === String(x.id)}
                        onClick={() => approve.mutate(String(x.id))}
                        aria-label={tw("confirm", { name: x.merchandiser.name })}
                      >
                        {approve.isPending && approve.variables === String(x.id) ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          tw("confirmButton")
                        )}
                      </Button>
                    ) : (
                      <StatusBadge
                        status={x.status === "approved" ? "completed" : "failed"}
                        label={x.status_label ?? tw(`statuses.${x.status}`)}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={pages} loading={isLoading} onPage={setPage} />
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Summary({
  label,
  value,
  tone,
  signed = false,
}: {
  label: string;
  value: number;
  tone: string;
  signed?: boolean;
}) {
  return (
    <section className="flex items-center gap-4 rounded-xl border bg-card p-6">
      <span className={cn("rounded-full p-3", tone)}>
        <CircleDollarSign />
      </span>
      <div>
        <p className="text-muted-foreground">{label}</p>
        <strong className="text-2xl">
          {signed && value >= 0 ? "+" : ""}${value.toLocaleString()}
        </strong>
      </div>
    </section>
  );
}

function Pagination({
  page,
  pages,
  loading,
  onPage,
}: {
  page: number;
  pages: number;
  loading: boolean;
  onPage: (p: number) => void;
}) {
  const t = useTranslations("adminPayments");
  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" disabled={page === 1 || loading} onClick={() => onPage(page - 1)}>
        <ChevronLeft className="rtl:rotate-180" />
        {t("pagination.previous")}
      </Button>
      <span>{t("pagination.page", { page, pages })}</span>
      <Button variant="outline" disabled={page === pages || loading} onClick={() => onPage(page + 1)}>
        {t("pagination.next")}
        <ChevronRight className="rtl:rotate-180" />
      </Button>
    </div>
  );
}
