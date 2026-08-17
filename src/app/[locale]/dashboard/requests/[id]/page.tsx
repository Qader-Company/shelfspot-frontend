import { RequestDetailsPage } from "@/modules/company/requests/details/page";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RequestDetailPage({ params }: Props) {
  const { id } = await params;
  return <RequestDetailsPage id={id} />;
}
