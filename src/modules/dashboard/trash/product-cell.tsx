import { BoxIcon } from "@/shared/components/dashboard/dashboard-icons";

interface ProductCellProps {
  name: string;
  thumbnailAlt: string;
}

export function ProductCell({ name, thumbnailAlt }: ProductCellProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Thumbnail placeholder */}
      <span
        aria-label={thumbnailAlt}
        className="flex size-10 shrink-0 items-center justify-center rounded border border-border bg-muted"
      >
        <BoxIcon className="size-5 text-muted-foreground" />
      </span>
      <span className="text-sm font-medium text-foreground">{name}</span>
    </div>
  );
}
