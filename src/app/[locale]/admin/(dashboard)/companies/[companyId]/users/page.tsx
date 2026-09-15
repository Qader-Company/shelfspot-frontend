import { CompanyUsersPage } from "@/modules/admin/companies/users-page";
export default async function Page({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  return <CompanyUsersPage companyId={companyId} />;
}
