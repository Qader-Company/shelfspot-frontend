import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <main className="mx-auto flex min-h-dvh max-w-7xl items-center justify-center px-4">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
    </main>
  );
}
