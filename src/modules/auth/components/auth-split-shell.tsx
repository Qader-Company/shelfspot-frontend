import Image from "next/image";
import type { ReactNode } from "react";

import { AuthWordmark } from "@/modules/auth/components/auth-wordmark";
import { cn } from "@/shared/lib/utils";

interface AuthSplitShellProps {
  children: ReactNode;
  className?: string;
  visualAlt: string;
  visualSrc: string;
}

export function AuthSplitShell({
  children,
  className,
  visualAlt,
  visualSrc,
}: AuthSplitShellProps) {
  return (
    <main className="min-h-dvh bg-background lg:h-dvh lg:overflow-hidden">
      <div className="flex min-h-dvh w-full lg:h-full">
        <section className="relative hidden h-full overflow-hidden rounded-br-[70px] bg-auth-visual lg:flex lg:min-w-0 lg:flex-1">
          <div className="absolute inset-0">
            <Image
              src={visualSrc}
              alt={visualAlt}
              fill
              priority
              sizes="50vw"
              className="object-cover object-center"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-auth-visual via-auth-visual/95 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex justify-center">
            <div className="h-20 w-52 rounded-full bg-auth-visual/90 blur-2xl" />
          </div>
          <div className="absolute inset-x-0 bottom-4 flex justify-center">
            <AuthWordmark />
          </div>
        </section>

        <section className="flex min-h-dvh min-w-0 flex-1 items-center justify-center bg-card px-4 py-6 sm:px-6 sm:py-8 lg:h-full lg:min-h-0 lg:flex-1 lg:items-start lg:justify-start lg:overflow-y-auto lg:px-10 lg:py-8 xl:px-12 xl:py-10">
          <div
            className={cn(
              "w-full max-w-[580px] lg:mx-auto",
              className,
            )}
          >
            <div className="mb-6 flex justify-center lg:hidden">
              <AuthWordmark />
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
