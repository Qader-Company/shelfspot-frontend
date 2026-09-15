"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCompanyUsers } from "./users-api";
export function CompanyUsersPreview({ companyId }: { companyId: string }) {
  const t = useTranslations("companyUsers");
  const query = useCompanyUsers(companyId);
  return <section className="min-w-0 rounded-xl border border-border bg-card p-5"><div className="flex items-center justify-between gap-4"><h2 className="text-lg font-bold">{t("previewTitle")}</h2><Link href={"/admin/companies/" + encodeURIComponent(companyId) + "/users"} className="text-sm font-medium text-primary hover:underline">{t("viewAll")}</Link></div>
    <div className="mt-4 max-h-80 overflow-auto rounded-lg border border-border"><table className="w-full min-w-[440px] text-sm"><thead className="sticky top-0 z-10 bg-card"><tr className="border-b border-border">{["name", "store", "email", "role"].map(key => <th key={key} className="p-4 text-start font-medium">{t(key)}</th>)}</tr></thead><tbody>{query.data?.map(user => <tr key={user.id} className="border-b border-border last:border-0"><td className="p-4">{user.name}</td><td className="p-4">&mdash;</td><td className="p-4"><bdi>{user.email}</bdi></td><td className="p-4">{user.roleName || "\u2014"}</td></tr>)}{!query.data?.length ? <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">{t(query.isPending ? "loading" : query.isError ? "error" : "empty")}{query.isError ? <button className="ms-2 text-primary underline" onClick={() => void query.refetch()}>{t("retry")}</button> : null}</td></tr> : null}</tbody></table></div>
  </section>;
}
