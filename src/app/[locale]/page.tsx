import { APP_CONFIG } from "@/config/app";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-7xl items-center justify-center px-4">
      <h1 className="text-3xl font-semibold tracking-tight">{APP_CONFIG.name}</h1>
    </main>
  );
}
