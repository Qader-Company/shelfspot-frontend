import Image from "next/image";

import { Button } from "@/shared/ui/button";

interface AuthSocialButtonsProps {
  appleLabel: string;
  facebookLabel: string;
  googleLabel: string;
}

const ICON_SIZE = 20;

export function AuthSocialButtons({
  appleLabel,
  facebookLabel,
  googleLabel,
}: AuthSocialButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:justify-center">
      <Button
        type="button"
        variant="outline"
        className="h-9 w-full rounded-md border-border bg-card px-0 text-foreground hover:bg-card sm:w-[70px]"
        aria-label={googleLabel}
      >
        <Image
          src="/auth/icons/google.png"
          alt=""
          aria-hidden="true"
          width={ICON_SIZE}
          height={ICON_SIZE}
          className="size-5 object-contain"
        />
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-9 w-full rounded-md border-border bg-card px-0 text-foreground hover:bg-card sm:w-[70px]"
        aria-label={facebookLabel}
      >
        <Image
          src="/auth/icons/facebook.png"
          alt=""
          aria-hidden="true"
          width={ICON_SIZE}
          height={ICON_SIZE}
          className="size-5 object-contain"
        />
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-9 w-full rounded-md border-border bg-card px-0 text-foreground hover:bg-card sm:w-[70px]"
        aria-label={appleLabel}
      >
        <Image
          src="/auth/icons/apple.png"
          alt=""
          aria-hidden="true"
          width={ICON_SIZE}
          height={ICON_SIZE}
          className="size-5 object-contain"
        />
      </Button>
    </div>
  );
}
