import { CreateRequestPage } from "@/modules/company/requests/create/page";

interface Props {
  searchParams: Promise<{ repeat?: string }>;
}

export default async function Page({ searchParams }: Props) {
  const { repeat } = await searchParams;
  return <CreateRequestPage repeatTaskId={repeat} />;
}
