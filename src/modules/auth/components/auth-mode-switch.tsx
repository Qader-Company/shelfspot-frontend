import { cn } from "@/shared/lib/utils";

interface AuthModeSwitchProps {
  active: "sign-in" | "sign-up";
  signInLabel: string;
  signUpLabel: string;
}

export function AuthModeSwitch({
  active,
  signInLabel,
  signUpLabel,
}: AuthModeSwitchProps) {
  return (
    <div className="grid h-14 grid-cols-2 gap-2 rounded-[20px] bg-muted p-1.5 sm:h-16 sm:gap-3 sm:rounded-[24px] sm:p-2">
      <span
        className={cn(
          "flex h-11 items-center justify-center rounded-2xl px-3 text-sm font-medium text-muted-foreground transition-colors sm:h-12 sm:rounded-[20px]",
          active === "sign-in" && "bg-card text-foreground shadow-xs",
        )}
      >
        {signInLabel}
      </span>
      <span
        className={cn(
          "flex h-11 items-center justify-center rounded-2xl px-3 text-sm font-medium text-muted-foreground transition-colors sm:h-12 sm:rounded-[20px]",
          active === "sign-up" && "bg-card text-foreground shadow-xs",
        )}
      >
        {signUpLabel}
      </span>
    </div>
  );
}
