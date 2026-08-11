"use client";

import { ChevronDown, LogOut, UserRound } from "lucide-react";

import { ROUTES } from "@/config/routes";
import { Link, useRouter } from "@/i18n/navigation";
import type { AuthContext } from "@/modules/auth/config/auth-context";
import { useLogoutMutation } from "@/modules/auth/hooks/use-auth-mutations";
import { Button } from "@/shared/ui/button";

interface PublicAuthActionsProps {
  authContext: AuthContext;
  dashboardLabel: string;
  profileLabel: string;
  signOutLabel: string;
}

export function PublicAuthActions({
  authContext,
  dashboardLabel,
  profileLabel,
  signOutLabel,
}: PublicAuthActionsProps) {
  const router = useRouter();
  const logoutMutation = useLogoutMutation(authContext);
  const dashboardHref = authContext === "admin" ? ROUTES.adminDashboard : ROUTES.dashboard;
  const profileHref = authContext === "admin" ? ROUTES.adminDashboard : ROUTES.dashboardProfile;

  async function signOut() {
    await logoutMutation.mutateAsync();
    router.replace(ROUTES.home);
    router.refresh();
  }

  return (
    <div className="hidden shrink-0 items-center gap-2 min-[824px]:flex min-[1200px]:gap-3">
      <Button asChild className="h-10 rounded-lg px-3 min-[1200px]:h-12 min-[1200px]:px-5 min-[1200px]:text-base">
        <Link href={dashboardHref}>{dashboardLabel}</Link>
      </Button>

      <details className="group relative">
        <summary className="flex size-10 cursor-pointer list-none items-center justify-center gap-1 rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/50 hover:text-primary min-[1200px]:size-12 [&::-webkit-details-marker]:hidden">
          <UserRound className="size-5" />
          <ChevronDown className="size-3 transition-transform group-open:rotate-180" />
          <span className="sr-only">{profileLabel}</span>
        </summary>
        <div className="absolute end-0 top-full z-50 mt-2 min-w-44 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-lg">
          <Link href={profileHref} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-primary">
            <UserRound className="size-4" />
            {profileLabel}
          </Link>
          <button
            type="button"
            disabled={logoutMutation.isPending}
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm font-medium text-destructive hover:bg-accent disabled:opacity-50"
          >
            <LogOut className="size-4" />
            {signOutLabel}
          </button>
        </div>
      </details>
    </div>
  );
}
