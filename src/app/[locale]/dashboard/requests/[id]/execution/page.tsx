import { ExecutionDetailsPage } from "@/modules/company/requests/execution/page";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ExecutionDetailsPage id={id} />;
}
