import { LoginPageView } from "@/modules/auth/components";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const { registered } = await searchParams;

  return (
    <LoginPageView
      authContext="company"
      showRegistrationSuccess={registered === "1"}
    />
  );
}
