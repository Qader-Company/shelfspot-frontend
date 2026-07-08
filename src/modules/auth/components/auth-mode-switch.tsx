import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";

interface AuthModeSwitchProps {
  active: "sign-in" | "sign-up";
  signInHref?: string;
  signInLabel: string;
  signUpHref?: string;
  signUpLabel: string;
}

export function AuthModeSwitch({
  active,
  signInHref,
  signInLabel,
  signUpHref,
  signUpLabel,
}: AuthModeSwitchProps) {
  return (
    <div className="grid h-14 grid-cols-2 gap-2 rounded-[20px] bg-muted p-1.5 sm:h-16 sm:gap-3 sm:rounded-[24px] sm:p-2">
      <AuthModeSwitchItem
        href={signInHref}
        className={cn(
          "flex h-11 items-center justify-center rounded-2xl px-3 text-sm font-medium text-muted-foreground transition-colors sm:h-12 sm:rounded-[20px]",
          active === "sign-in" && "bg-card text-foreground shadow-xs",
        )}
      >
        {signInLabel}
      </AuthModeSwitchItem>
      <AuthModeSwitchItem
        href={signUpHref}
        className={cn(
          "flex h-11 items-center justify-center rounded-2xl px-3 text-sm font-medium text-muted-foreground transition-colors sm:h-12 sm:rounded-[20px]",
          active === "sign-up" && "bg-card text-foreground shadow-xs",
        )}
      >
        {signUpLabel}
      </AuthModeSwitchItem>
    </div>
  );
}

function AuthModeSwitchItem({
  children,
  className,
  href,
}: {
  children: React.ReactNode;
  className: string;
  href?: string;
}) {
  if (!href) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
