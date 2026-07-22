import { AdminCompanyCatalogPage } from "@/modules/admin/companies/page";

interface PageProps {
  params: Promise<{
    companyId: string;
    resource: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { resource } = await params;

  return <AdminCompanyCatalogPage resource={resource} />;
}
