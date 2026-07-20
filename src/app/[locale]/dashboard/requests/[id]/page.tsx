import { getRequestById } from "@/modules/company/requests/details/seed";
import { RequestDetailsPage } from "@/modules/company/requests/details/page";

interface Props {
  params: { id: string };
}

export default function RequestDetailPage({ params }: Props) {
  const request = getRequestById(params.id);
  return <RequestDetailsPage request={request} />;
}
