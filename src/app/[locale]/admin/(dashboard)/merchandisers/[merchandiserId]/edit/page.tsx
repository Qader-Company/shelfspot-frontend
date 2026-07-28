import { MerchandiserForm } from "@/modules/admin/merchandisers/form";

export default async function Page({
  params,
}: {
  params: Promise<{ merchandiserId: string }>;
}) {
  const { merchandiserId } = await params;
  return <MerchandiserForm merchandiserId={merchandiserId} />;
}
