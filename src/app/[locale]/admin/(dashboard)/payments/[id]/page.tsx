import { PaymentDetailsPage } from "@/modules/admin/payments/details";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PaymentDetailsPage id={id} />;
}
