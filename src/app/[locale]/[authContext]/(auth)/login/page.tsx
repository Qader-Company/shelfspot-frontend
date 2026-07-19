import { notFound } from "next/navigation";
import { isAuthContext } from "@/modules/auth/config/auth-context";
import { LoginPageView } from "@/modules/auth/components";

export default async function AuthLoginPage({ params, searchParams }: { params: Promise<{ authContext: string }>; searchParams: Promise<{ registered?: string }> }) {
  const [{ authContext }, { registered }] = await Promise.all([params, searchParams]);
  if (!isAuthContext(authContext)) notFound();
  return <LoginPageView authContext={authContext} showRegistrationSuccess={authContext === "company" && registered === "1"} />;
}
