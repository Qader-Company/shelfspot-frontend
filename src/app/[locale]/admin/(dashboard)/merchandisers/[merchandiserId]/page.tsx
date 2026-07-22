import { MerchandiserDetails } from "@/modules/admin/merchandisers/details";
export default async function Page({ params }: { params: Promise<{ merchandiserId: string }> }) { const { merchandiserId } = await params; return <MerchandiserDetails merchandiserId={merchandiserId} />; }
