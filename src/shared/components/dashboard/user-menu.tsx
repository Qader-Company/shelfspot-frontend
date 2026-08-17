import { Button } from "@/shared/ui/button";
import type { AuthContext } from "@/modules/auth/config/auth-context";

import type { DashboardUser } from "./types";
import { CompanyProfileUserMenu } from "./company-profile-user-menu";

interface UserMenuProps {
  authContext: AuthContext;
  user: DashboardUser;
  label: string;
}

export function UserMenu({ authContext, user, label }: UserMenuProps) {
  if (authContext === "company") {
    return <CompanyProfileUserMenu fallbackUser={user} label={label} />;
  }

  return (
    <Button
      aria-label={label}
      className="h-auto min-w-0 gap-3 rounded-full px-2 py-1 text-start hover:bg-muted"
      variant="ghost"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--dashboard-avatar-background)]">
        <span className="size-5 rotate-12 rounded-[4px] bg-[var(--dashboard-avatar-foreground)]" />
      </span>
      <span className="hidden min-w-0 flex-col md:flex">
        <span className="truncate text-sm font-semibold leading-5 text-foreground">
          {user.name}
        </span>
        <span className="truncate text-xs leading-4 text-muted-foreground">
          {user.description}
        </span>
      </span>
    </Button>
  );
}
