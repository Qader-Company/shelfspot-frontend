import { AdminRequestExecution } from "@/modules/admin/requests/execution";

export default async function Page({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;
  return <AdminRequestExecution requestId={requestId} />;
}
