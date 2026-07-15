import { getRequestById } from "@/modules/dashboard/requests/request-details.seed";
import { RequestDetailsPage } from "@/modules/dashboard/requests/request-details-page";

interface Props {
  params: { id: string };
}

export default function RequestDetailPage({ params }: Props) {
  const request = getRequestById(params.id);
  return <RequestDetailsPage request={request} />;
}
