import { CreateRequestPage } from "@/modules/company/requests/create/page";

export default async function EditRequestRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CreateRequestPage taskId={id} />;
}
