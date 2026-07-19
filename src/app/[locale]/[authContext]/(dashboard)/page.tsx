import { notFound } from "next/navigation";
import { AdminDashboardPage } from "@/modules/admin/dashboard";

export default async function ContextDashboardPage({ params }: { params: Promise<{ authContext: string }> }) {
  const { authContext } = await params;
  if (authContext !== "admin") notFound();
  return <AdminDashboardPage />;
}
