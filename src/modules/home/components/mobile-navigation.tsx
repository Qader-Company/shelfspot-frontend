"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { Locale } from "@/i18n/locale";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";
import type { AuthContext } from "@/modules/auth/config/auth-context";
import { useLogoutMutation } from "@/modules/auth/hooks/use-auth-mutations";
import { ROUTES } from "@/config/routes";

interface MobileNavigationProps {
  closeLabel: string;
  links: Array<{ href: string; isActive?: boolean; label: string }>;
  locale: Locale;
  loginHref: string;
  loginLabel: string;
  menuLabel: string;
  authContext: AuthContext | null;
  dashboardLabel: string;
  profileLabel: string;
  signOutLabel: string;
}

export function MobileNavigation({
  closeLabel,
  links,
  locale,
  loginHref,
  loginLabel,
  menuLabel,
  authContext,
  dashboardLabel,
  profileLabel,
  signOutLabel,
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isRtl = locale === "ar";
  const router = useRouter();
  const logoutMutation = useLogoutMutation(authContext ?? "company");
  const dashboardHref = authContext === "admin" ? ROUTES.adminDashboard : ROUTES.dashboard;

  async function signOut() {
    if (!authContext) return;
    await logoutMutation.mutateAsync();
    setIsOpen(false);
    router.replace(ROUTES.home);
    router.refresh();
  }

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="shrink-0 min-[824px]:hidden">
      <button
        type="button"
        aria-label={menuLabel}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="flex size-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:border-primary/50 hover:text-primary"
      >
        <Menu className="size-5" />
      </button>

      <button
        type="button"
        aria-label={closeLabel}
        onClick={() => setIsOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/35 transition-opacity duration-300",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        dir={isRtl ? "rtl" : "ltr"}
        aria-hidden={!isOpen}
        className={cn(
          "fixed inset-y-0 z-50 flex w-[min(20rem,85vw)] flex-col bg-card p-5 transition-transform duration-300 ease-out",
          isRtl ? "left-0" : "right-0",
          isOpen
            ? "pointer-events-auto translate-x-0 shadow-2xl"
            : isRtl
              ? "pointer-events-none -translate-x-full shadow-none"
              : "pointer-events-none translate-x-full shadow-none",
        )}
      >
        <div className={cn("mb-6 flex", isRtl ? "justify-end" : "justify-start")}>
          <button
            type="button"
            aria-label={closeLabel}
            onClick={() => setIsOpen(false)}
            className="flex size-10 items-center justify-center rounded-lg border border-border text-foreground hover:border-primary/50 hover:text-primary"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-primary",
                link.isActive ? "bg-accent text-primary" : "text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {authContext ? (
          <div className="mt-6 grid gap-2">
            <Link href={dashboardHref} onClick={() => setIsOpen(false)} className="flex min-h-12 items-center justify-center rounded-lg bg-primary px-4 py-3 text-base font-semibold text-white hover:bg-primary/90">
              {dashboardLabel}
            </Link>
            {authContext === "company" ? (
              <Link href={ROUTES.dashboardProfile} onClick={() => setIsOpen(false)} className="flex min-h-11 items-center justify-center rounded-lg border border-border px-4 py-2 font-medium hover:border-primary/50 hover:text-primary">
                {profileLabel}
              </Link>
            ) : null}
            <button type="button" onClick={signOut} disabled={logoutMutation.isPending} className="min-h-11 rounded-lg px-4 py-2 font-medium text-destructive hover:bg-accent disabled:opacity-50">
              {signOutLabel}
            </button>
          </div>
        ) : (
          <Link href={loginHref} onClick={() => setIsOpen(false)} className="mt-6 flex min-h-12 items-center justify-center rounded-lg bg-primary px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-primary/90">
            {loginLabel}
          </Link>
        )}
      </aside>
    </div>
  );
}
