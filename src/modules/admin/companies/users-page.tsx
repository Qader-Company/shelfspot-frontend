"use client";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ErrorState, PageLoadingSkeleton } from "@/shared/components/feedback";
import { useCompany } from "./hooks";
import { CompanyUsersView } from "./users-view";
import { companyUsersKey, getCompanyUser, deleteCompanyUser, saveCompanyUser, useCompanyRoles, useCompanyUsers, type UserFilters } from "./users-api";
export function CompanyUsersPage({ companyId }: { companyId: string }) {
  const t = useTranslations("companyUsers");
  const client = useQueryClient();
  const company = useCompany(companyId);
  const [filters, setFilters] = useState<UserFilters>({ search: "", role: "", is_active: "" });
  const [search, setSearch] = useState("");
  useEffect(() => { const timer = setTimeout(() => setSearch(filters.search), 300); return () => clearTimeout(timer); }, [filters.search]);
  const users = useCompanyUsers(companyId, { ...filters, search });
  const roles = useCompanyRoles(companyId);
  const refresh = () => client.invalidateQueries({ queryKey: companyUsersKey(companyId) });
  if (company.isPending) return <PageLoadingSkeleton cardCount={1} tableRows={6} tableColumns={6} />;
  if (company.isError || !company.data) return <ErrorState title={t("error")} retryLabel={t("retry")} onRetry={() => void company.refetch()} />;
  return <>
    {users.isError || roles.isError ? <ErrorState title={t("error")} retryLabel={t("retry")} onRetry={() => { void users.refetch(); void roles.refetch(); }} /> : null}
    <CompanyUsersView company={company.data} users={users.data ?? []} roles={roles.data ?? []} loading={users.isPending} filters={filters} onFilter={(key, value) => setFilters(previous => ({ ...previous, [key]: value }))}
      onLoad={id => getCompanyUser(companyId, id)}
      onSave={async (input, id, existingRoles) => { await saveCompanyUser(companyId, input, id, existingRoles); await refresh(); }}
      onDelete={async id => { await deleteCompanyUser(companyId, id); await refresh(); }}
      onToggle={async user => { const fresh = await getCompanyUser(companyId, user.id); await saveCompanyUser(companyId, { ...fresh, active: !user.active }, user.id, fresh.roles); await refresh(); }} />
  </>;
}
