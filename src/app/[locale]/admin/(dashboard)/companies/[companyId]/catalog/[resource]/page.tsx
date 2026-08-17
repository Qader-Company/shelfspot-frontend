import { AdminCompanyCatalogPage } from "@/modules/admin/companies/catalog";

interface PageProps {
  params: Promise<{
    companyId: string;
    resource: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { companyId, resource } = await params;

  return (
    <AdminCompanyCatalogPage companyId={companyId} resource={resource} />
  );
}
