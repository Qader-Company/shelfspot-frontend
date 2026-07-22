import { CompanyDetailsPage } from "@/modules/admin/companies/details";

export default async function Page({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  return <CompanyDetailsPage companyId={companyId} />;
}
