import Image from "next/image";

import { cn } from "@/shared/lib/utils";

export interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({
  className,
  width = 292,
  height = 108,
}: LogoProps) {
  return (
    <Image
      src="/shelfspot-logo.png"
      alt="ShelfSpot"
      width={width}
      height={height}
      className={cn(className)}
    />
  );
}
