"use client";

import { useState } from "react";
import { BoxIcon } from "@/shared/components/dashboard/dashboard-icons";

interface ProductCellProps {
  name: string;
  thumbnailAlt: string;
  thumbnailUrl?: string | null;
}

export function ProductCell({ name, thumbnailAlt, thumbnailUrl }: ProductCellProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const showImage = Boolean(thumbnailUrl) && !hasImageError;

  return (
    <div className="flex items-center gap-3">
      <span
        className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-muted"
      >
        {showImage ? (
          // API image hosts are supplied dynamically.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl!}
            alt={thumbnailAlt}
            className="size-full object-contain"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <BoxIcon
            className="size-5 text-muted-foreground"
            aria-label={thumbnailAlt}
          />
        )}
      </span>
      <span className="text-sm font-medium text-foreground">{name}</span>
    </div>
  );
}
