import type { ReactNode } from "react";
export function AuthLoginShell({ children }: { children: ReactNode }) {
  return <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12 sm:px-6"><div className="w-full max-w-[580px]">{children}</div></main>;
}
